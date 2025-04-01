#pragma once
#include <QThread>
#include <memory>

class Worker : public QObject 
{
    Q_OBJECT
public:
    Worker(QObject *parent = nullptr);
    ~Worker() = default;
    void start();
    bool isBusy();

signals:
    void signalTaskCome(QString in_data);
    void signalDone(QString data);

public slots:
    void doTask(QString data);

private:
    bool is_busy;
    QThread* m_thread;
};