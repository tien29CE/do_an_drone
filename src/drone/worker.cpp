#include "worker.h"
#include "worker_thread_pool.h"

Worker::Worker(QObject *parent)
    : QObject(nullptr)
    , m_thread(new QThread())
    , m_isBusy(false)
    , m_workerPool(parent)
{
    QObject::connect(this, &Worker::signalTaskCome, this, &Worker::doTask, Qt::QueuedConnection);
    QObject::connect(this->m_thread, &QThread::finished, this, &Worker::deleteLater);
}

void Worker::start()
{
    this->moveToThread(this->m_thread);
    this->m_thread->start();
}

void Worker::doTask(QString data)
{
    this->m_isBusy = true;
    //To do

    this->m_isBusy = false;
    qobject_cast<WorkerThreadPool*>(this->m_workerPool)->emitTaskDone(std::move(data));
}

bool Worker::isBusy()
{
    return this->m_isBusy;
}