#include "drone.h"

Drone::Drone(QObject *parent)
    : QObject(parent)
    , m_thread(new QThread())
{
    this->moveToThread(this->m_thread);
    QObject::connect(this->m_thread, &QThread::started, this, &Drone::run);
    this->m_thread->start();
}

void Drone::run()
{
    this->m_socket = std::make_unique<WebSocketClient>(this);
    this->m_socket->connect("localhost", 4000);
    this->m_workerPool = std::make_unique<WorkerThreadPool>();
    this->m_workerPool->start();
}