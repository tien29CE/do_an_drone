#pragma once
#include <QThread>

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
    bool m_isBusy;
    QThread* m_thread;
    QObject* m_workerPool;
};