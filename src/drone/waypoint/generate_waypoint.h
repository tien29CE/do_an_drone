#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <iomanip>

#include <boost/geometry.hpp>
#include <boost/geometry/geometries/point_xy.hpp>
#include <boost/geometry/geometries/polygon.hpp>
#include <boost/geometry/geometries/linestring.hpp>
#include <boost/geometry/algorithms/centroid.hpp>
#include <boost/geometry/algorithms/intersection.hpp>
#include <boost/geometry/algorithms/envelope.hpp>
#include <boost/geometry/algorithms/simplify.hpp> // for simplify

#include <proj.h>

// Define geometry types using Boost.Geometry.
using Point = boost::geometry::model::d2::point_xy<double>;
using Polygon = boost::geometry::model::polygon<Point>;
using LineString = boost::geometry::model::linestring<Point>;

// Convert degrees to radians.
namespace GenerateWaypoint
{
    double deg2rad(double deg);

    // Rotate a point about a given origin by a specified angle (in radians)
    Point rotatePoint(const Point &pt, const Point &origin, double angle_rad);

    // Rotate an entire polygon about a given origin.
    Polygon rotatePolygon(const Polygon &poly, double angle_deg, const Point &origin);

    // Generate a coverage (lawnmower) path.
    std::vector<Point> generate_coverage_path(const std::vector<std::pair<double, double>> &coords, double scan_area_hectares = 20.0, double orientation = 0.0);
}