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
    this->m_workerPool = new WorkerThreadPool();
    this->m_socket = new WebSocketClient(this->m_workerPool);
    this->m_workerPool->start();
    this->m_socket->connect("localhost", 4000);
}