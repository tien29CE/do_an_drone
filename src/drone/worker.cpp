#include "worker.h"

Worker::Worker(QObject *parent)
    : QObject(parent)
    , m_thread(new QThread(this))
{
    QObject::connect(this, &Worker::signalTaskCome, this, &Worker::doTask, Qt::QueuedConnection);
}

void Worker::start()
{
    this->moveToThread(this->m_thread);
    this->m_thread->start();
}

void Worker::doTask(QString data)
{
    this->is_busy = true;
    //To do

    this->is_busy = false;
    emit this->signalDone(std::move(data));
}

bool Worker::isBusy()
{
    return this->is_busy;
}