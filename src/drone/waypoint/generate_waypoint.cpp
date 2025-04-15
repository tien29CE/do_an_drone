#include "generate_waypoint.h"

namespace GenerateWaypoint{
double deg2rad(double deg) {
    return deg * 3.14159 / 180.0;
}

// Rotate a point about a given origin by a specified angle (in radians)
Point rotatePoint(const Point &pt, const Point &origin, double angle_rad) {
    double ox = boost::geometry::get<0>(origin);
    double oy = boost::geometry::get<1>(origin);
    double px = boost::geometry::get<0>(pt);
    double py = boost::geometry::get<1>(pt);

    double qx = ox + std::cos(angle_rad) * (px - ox) - std::sin(angle_rad) * (py - oy);
    double qy = oy + std::sin(angle_rad) * (px - ox) + std::cos(angle_rad) * (py - oy);
    return Point(qx, qy);
}

// Rotate an entire polygon about a given origin.
Polygon rotatePolygon(const Polygon &poly, double angle_deg, const Point &origin) {
    Polygon rotated;
    double angle_rad = deg2rad(angle_deg);
    for (const auto &pt : poly.outer()) {
        boost::geometry::append(rotated.outer(), rotatePoint(pt, origin, angle_rad));
    }
    // Ensure the polygon is closed.
    if (!rotated.outer().empty())
        rotated.outer().push_back(rotated.outer().front());
    return rotated;
}

std::vector<Point> generate_coverage_path(const std::vector<std::pair<double, double>> &coords, double scan_area_hectares, double orientation)
{
    std::vector<Point> finalPath;

    // Create a PROJ context and transformers.
    PJ_CONTEXT *proj_context = proj_context_create();
    // Transformer from EPSG:4326 to EPSG:32648 (UTM Zone 48N).
    // Note: In Shapely the transformer is created with always_xy=True and then called with (lon, lat).
    PJ *to_utm = proj_create_crs_to_crs(proj_context,
                                        "EPSG:4326", "EPSG:32648", nullptr);
    // Transformer from UTM back to EPSG:4326.
    PJ *to_latlon = proj_create_crs_to_crs(proj_context,
                                           "EPSG:32648", "EPSG:4326", nullptr);
    if (!to_utm || !to_latlon) {
        std::cerr << "Error creating PROJ transformers." << std::endl;
        return finalPath;
    }

    // Step 1: Convert input coordinates to UTM.
    // (Coordinates are given as (lat, lon) but we call the transformer with (lon, lat)
    // to simulate always_xy=True.)
    std::vector<Point> projectedPoints;
    for (const auto &latlon : coords) {
        double lat = latlon.first;
        double lon = latlon.second;
        PJ_COORD in;
        in.xy.x = lon;  // longitude first
        in.xy.y = lat;  // then latitude
        PJ_COORD out = proj_trans(to_utm, PJ_FWD, in);
        projectedPoints.push_back(Point(out.xy.x, out.xy.y));
    }

    // Create a polygon from the projected points.
    Polygon poly;
    for (const auto &pt : projectedPoints) {
        boost::geometry::append(poly.outer(), pt);
    }
    if (!poly.outer().empty())
        poly.outer().push_back(poly.outer().front());

    // Compute the centroid of the polygon.
    Point centroid;
    boost::geometry::centroid(poly, centroid);

    // Step 2: Rotate the polygon by the given orientation (in degrees).
    Polygon rotated_poly = rotatePolygon(poly, orientation, centroid);

    // Step 3: Get the bounding box of the rotated polygon.
    boost::geometry::model::box<Point> bounds;
    boost::geometry::envelope(rotated_poly, bounds);
    double minx = bounds.min_corner().get<0>();
    double miny = bounds.min_corner().get<1>();
    double maxx = bounds.max_corner().get<0>();
    double maxy = bounds.max_corner().get<1>();

    double length = maxy - miny;
    // Compute the sweep spacing: strip_width = (scan_area_hectares * 10,000) / length.
    double strip_width = (scan_area_hectares * 10000.0) / length;

    // Step 4: Generate vertical lines and compute intersections with the rotated polygon.
    std::vector<Point> pathPoints;
    bool toggle = false;
    for (double x = minx; x <= maxx; x += strip_width) {
        LineString line;
        line.push_back(Point(x, miny));
        line.push_back(Point(x, maxy));

        std::vector<LineString> intersections;
        boost::geometry::intersection(rotated_poly, line, intersections);

        if (intersections.empty())
            continue;

        for (auto &ls : intersections) {
            if (ls.empty())
                continue;
            if (toggle)
                std::reverse(ls.begin(), ls.end());
            // In Shapely, the entire set of vertices is appended.
            // Here we append all points in ls.
            for (const auto &pt : ls)
                pathPoints.push_back(pt);
        }
        toggle = !toggle;
    }

    // Step 5: Form a LineString from the collected points.
    LineString pathLine;
    for (const auto &pt : pathPoints)
        pathLine.push_back(pt);

    // Rotate the path back by -orientation.
    LineString finalLine;
    for (const auto &pt : pathLine)
        finalLine.push_back(rotatePoint(pt, centroid, -deg2rad(orientation)));

    // (Optional) Simplify the line to remove duplicate/close points.
    // The tolerance value below is chosen based on experimentation. Adjust as needed.
    LineString simplifiedLine;
    double tolerance = 1.0;  // tolerance in UTM units; adjust if required
    boost::geometry::simplify(finalLine, simplifiedLine, tolerance);

    // Convert each point from UTM back to EPSG:4326.
    // The transformer returns (lon, lat); we reverse these to produce (lat, lon).
    for (const auto &pt : simplifiedLine) {
        PJ_COORD in;
        in.xy.x = boost::geometry::get<0>(pt);
        in.xy.y = boost::geometry::get<1>(pt);
        PJ_COORD out = proj_trans(to_latlon, PJ_FWD, in);
        // Reverse the order to (lat, lon)
        finalPath.push_back(Point(out.xy.y, out.xy.x));
    }

    // Free PROJ resources.
    proj_destroy(to_utm);
    proj_destroy(to_latlon);
    proj_context_destroy(proj_context);

    return finalPath;
}
}


// int main()
// {
//     // Define original waypoints in (lat, lon) order.
//     std::vector<std::pair<double, double>> original_waypoints = {
//         {106.65454420453804, 10.768783802693736},
//         {106.65593948604713, 10.769289994454406},
//         {106.65776408494362, 10.767117582140541},
//         {106.65703424538503, 10.765303711316012}
//     };

//     // Generate the coverage path with scan_area_hectares = 0.5.
//     std::vector<Point> path = generate_coverage_path(original_waypoints, 0.5, 0.0);

//     std::cout << "Số lượng waypoints: " << path.size() << std::endl;

//     // Set fixed notation and precision.
//     std::cout << std::fixed << std::setprecision(8);
//     for (const auto &pt : path) {
//         std::cout << "(" << boost::geometry::get<1>(pt) << ", "
//                   << boost::geometry::get<0>(pt) << ")," << std::endl;
//     }

//     return 0;
// }
