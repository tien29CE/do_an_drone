#pragma once
#include <QWebSocket>
#include <QThread>
#include <QDebug>
#include "worker_thread_pool.h"

class WebSocketClient : public QObject
{
    Q_OBJECT
public:
    WebSocketClient(QObject *parent = nullptr);
    void connect(const QString &host, quint16 port);

public slots:
    void onConnected();
    void onDisconnected();
    void onStateChange();
    void sendMessage(QString message);
    void addTask(QString data);

private:
    QWebSocket *m_socket;
    QUrl m_url;
    QThread *m_thread;
    WorkerThreadPool* m_parent;
};