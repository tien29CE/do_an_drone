#include "worker_thread_pool.h"

WorkerThreadPool::WorkerThreadPool(QObject *parent)
    : QObject(parent)
    , m_thread(new QThread())
{
    for(size_t i = 0; i < WORKER_THREAD_POOL_SIZE; i++) {
        auto worker = new Worker(this);
        QObject::connect(worker, SIGNAL(signalDone(QString)), this, SLOT(emitTaskDone(QString)), Qt::QueuedConnection);
        worker->start();
        this->m_workers.emplace_back(worker);
    }
    QObject::connect(this->m_thread, &QThread::started, this, &WorkerThreadPool::startPool);
}

WorkerThreadPool::~WorkerThreadPool()
{
    while(!this->m_workers.isEmpty()) {
        delete this->m_workers.front();
        this->m_workers.pop_front();
    }
}

void WorkerThreadPool::addTask(QString data)
{
    this->m_safeQueue.enqueue(std::move(data));
}

QString WorkerThreadPool::removeTask()
{
    return this->m_safeQueue.dequeue();
}

void WorkerThreadPool::emitTaskDone(QString data)
{
    emit this->signalOneTaskDone(std::move(data));
}

void WorkerThreadPool::start()
{
    this->moveToThread(this->m_thread);
    this->m_thread->start();
}

void WorkerThreadPool::startPool()
{
    while(true)
    {
        try {
            for(auto it = this->m_workers.begin(); it != this->m_workers.end(); it++) {
                auto item = this->m_safeQueue.dequeue();
                if (!(*it)->isBusy()) {
                    emit (*it)->signalTaskCome(item);
                }
            }

        } catch(const std::exception &e) {
            throw e;
        }
    }
}