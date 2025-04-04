#pragma once
#include <QObject>
#include "safe_queue.h"
#include "worker.h"

#define WORKER_THREAD_POOL_SIZE 5

class WorkerThreadPool : public QObject
{
    Q_OBJECT
public:
    explicit WorkerThreadPool(QObject *parent = nullptr);
    ~WorkerThreadPool();
    void start();
signals:
    void signalOneTaskDone(QString data);

public slots:
    void addTask(QString data);
    QString removeTask();
    void emitTaskDone(QString data);

protected:
    void startPool();

private:
    QThread* m_thread;
    QList<Worker *> m_workers;
    SafeQueue<QString> m_safeQueue;
};