#pragma once
#include <QtCore/QObject>
#include <QtCore/QList>
#include <QtCore/QThread>
#include "websocket_client.h"

class Drone : public QObject
{
    Q_OBJECT

public:
    Drone();
    ~Drone() = default;
    void run();

private:
    QThread *m_thread;
    std::shared_ptr<WebSocketClient> m_socket;
};