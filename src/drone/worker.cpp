#include "worker.h"
#include "worker_thread_pool.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include "waypoint/generate_waypoint.h"

Worker::Worker(QObject *parent)
    : QObject(nullptr)
    , m_thread(new QThread())
    , m_isBusy(false)
    , m_workerPool(parent)
{
    QObject::connect(this, &Worker::signalTaskCome, this, &Worker::doTask, Qt::QueuedConnection);
    QObject::connect(this->m_thread, &QThread::finished, this, &Worker::deleteLater);
}

void Worker::start()
{
    this->moveToThread(this->m_thread);
    this->m_thread->start();
}

void Worker::doTask(QString data)
{
    this->m_isBusy = true;
    QJsonObject send_back_data;
    // Calculate waypoint
    QJsonObject json_data = QJsonDocument::fromJson(data.toUtf8()).object();
    if (json_data.value("command").toString() == "Calculate waypoints" && json_data.value("mode").toString() == "polygon") {
        std::vector<std::pair<double, double>> coords;
        for (const auto &point : json_data["polygonPoints"].toArray()) {
            QJsonArray pointObj = point.toArray();
            coords.emplace_back(std::make_pair(pointObj[1].toDouble(), pointObj[0].toDouble()));
        }

        std::vector<Point> path = GenerateWaypoint::generate_coverage_path(coords, 0.7, 0);
        QJsonArray pathPoints;
        for (const auto &pt : path) {
            QJsonArray pointObj;
            pointObj.append(boost::geometry::get<0>(pt));
            pointObj.append(boost::geometry::get<1>(pt));
            pathPoints.append(pointObj);
        }
        send_back_data.insert("wayPoints", pathPoints);
        send_back_data.insert("command", "Follow waypoints");
        auto transmit_data = QString(QJsonDocument(send_back_data).toJson());
        qobject_cast<WorkerThreadPool*>(this->m_workerPool)->emitTaskDone(std::move(transmit_data));
    }

    this->m_isBusy = false;
}

bool Worker::isBusy()
{
    return this->m_isBusy;
}