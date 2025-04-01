#pragma once
#include <QObject>
#include <thread>
#include <memory>
#include "safe_queue.h"
#include "worker.h"

class WorkerThreadPool : public QObject
{
    Q_OBJECT
public:
    explicit WorkerThreadPool(QObject *parent = nullptr);
    ~WorkerThreadPool();
    void addTask(QString &&data);
    void start();

protected:
    void startPool();

private:
    QThread* m_thread;
    QList<Worker *> m_workers;
    SafeQueue<QString> m_safeQueue;
};