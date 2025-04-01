#pragma once
#include <QtCore/QObject>
#include <QtCore/QThread>
#include "websocket_client.h"
#include "worker_thread_pool.h"

class Drone : public QObject
{
    Q_OBJECT
public:
    Drone(QObject *parent = nullptr);
    ~Drone() = default;
    void run();

private:
    QThread *m_thread;
    std::unique_ptr<WebSocketClient> m_socket;
    std::unique_ptr<WorkerThreadPool> m_workerPool;
};