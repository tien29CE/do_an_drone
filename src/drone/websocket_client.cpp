#include "websocket_client.h"
#include <QTimer>
#include <QJsonObject>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonValue>

WebSocketClient::WebSocketClient(QObject *parent)
    : QObject(parent)
    , m_socket(new QWebSocket())
{
    QObject::connect(this->m_socket, &QWebSocket::connected, this, &WebSocketClient::onConnected);
    QObject::connect(this->m_socket, &QWebSocket::disconnected, this, &WebSocketClient::onDisconnected);
    QObject::connect(this->m_socket, &QWebSocket::stateChanged, this, &WebSocketClient::onStateChange);
}

void WebSocketClient::connect(const QString &host, quint16 port)
{
    QUrl url = QString("ws://%1:%2").arg(host, QString::number(port));
    this->m_socket->open(url);
}

void WebSocketClient::onConnected()
{
    qDebug() << "✅ Đã kết nối đến Next.js Socket!";
    QObject::connect(this->m_socket, &QWebSocket::textFrameReceived, this, &WebSocketClient::onMessageReceived);
    this->m_socket->sendBinaryMessage("Xin chào từ Qt Backend!");
}

void WebSocketClient::onDisconnected()
{
    qDebug() << "Đã ngắt kết nối";
    this->m_socket->close();
}

void WebSocketClient::onStateChange()
{
    qDebug() << this->m_socket->state();
}

void WebSocketClient::onMessageReceived(const QString &message, bool is_last_frame) {
    QJsonObject data = QJsonDocument::fromJson(message.toUtf8()).object();

    qDebug() << data;
}