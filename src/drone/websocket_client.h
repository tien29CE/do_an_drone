#pragma once
#include <QWebSocket>
#include <QDebug>

class WebSocketClient : public QObject {
    Q_OBJECT
public:
    WebSocketClient(QObject *parent);
    void connect(const QString &host, quint16 port);

public slots:
    void onConnected();
    void onDisconnected();
    void onMessageReceived(const QString &message, bool is_last_frame);
    void onStateChange();

private:
    QWebSocket *m_socket;
};
