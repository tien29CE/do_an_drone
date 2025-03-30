#include "drone.h"

Drone::Drone()
    : QObject()
    , m_thread(new QThread())
    , m_socket(nullptr)
{
    this->moveToThread(this->m_thread);
    QObject::connect(this->m_thread, &QThread::started, this, &Drone::run);
    this->m_thread->start();
}

void Drone::run()
{
    this->m_socket = std::make_shared<WebSocketClient>(this);
    this->m_socket->connect("localhost", 4000);
}