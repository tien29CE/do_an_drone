#include "websocket_client.h"
#include <QTimer>
#include <QJsonObject>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonValue>

WebSocketClient::WebSocketClient(QObject *parent)
    : QObject(nullptr)
    , m_socket(new QWebSocket())
    , m_thread(new QThread())
    , m_parent(qobject_cast<WorkerThreadPool *>(parent))
{
    QObject::connect(this->m_socket, &QWebSocket::connected, this, &WebSocketClient::onConnected);
    QObject::connect(this->m_socket, &QWebSocket::disconnected, this, &WebSocketClient::onDisconnected);
    QObject::connect(this->m_socket, &QWebSocket::stateChanged, this, &WebSocketClient::onStateChange);
    QObject::connect(this->m_socket, SIGNAL(textMessageReceived(const QString &)), this, SLOT(addTask(QString)));
    QObject::connect(this->m_parent, SIGNAL(signalOneTaskDone(QString)), this, SLOT(sendMessage(QString)));
}

void WebSocketClient::connect(const QString &host, quint16 port)
{
    this->m_url = QString("wss://%1:%2").arg(host, QString::number(port));
    qDebug() << this->m_url;
    this->m_socket->open(this->m_url);
}

void WebSocketClient::onConnected()
{
    qDebug() << "✅ Đã kết nối đến Next.js Socket!";
    QJsonObject json_data = {
        {"command", "registry"},
        {"name", "backend"}
    };
    this->m_socket->sendTextMessage(std::move(QString(QJsonDocument(json_data).toJson())));
}

void WebSocketClient::onDisconnected()
{
    qDebug() << "Đã ngắt kết nối";
    this->m_socket->close();
}

void WebSocketClient::onStateChange()
{
    qDebug() << "Trạng thái socket đã thay đổi: " << this->m_socket->state();
    if(this->m_socket->state() == QAbstractSocket::UnconnectedState) {
        // this->m_socket->open(this->m_url);
        qDebug() << "Đang kết nối lại đến Next.js Socket...";
    }
}

void WebSocketClient::sendMessage(QString message)
{
    if (this->m_socket->state() == QAbstractSocket::ConnectedState) {
        this->m_socket->sendTextMessage(message);
        return;
    }

    qDebug() << "Không thể gửi tin nhắn, socket không kết nối!";
}

void WebSocketClient::addTask(QString data)
{
    if (this->m_parent) {
        this->m_parent->addTask(std::move(data));
    } else {
        qDebug() << "Không thể thêm tác vụ, WorkerThreadPool không hợp lệ!";
    }
}