#include "worker_thread_pool.h"

WorkerThreadPool::WorkerThreadPool(QObject *parent)
    : QObject(parent)
    , m_thread(new QThread())
{
    for(size_t i = 0; i < 3; i++) {
        auto worker = new Worker();
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

void WorkerThreadPool::addTask(QString &&data)
{
    this->m_safeQueue.enqueue(std::move(data));
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
            auto item = this->m_safeQueue.dequeue();
            for(auto it = this->m_workers.begin(); it != this->m_workers.end(); it++) {
                if (!(*it)->isBusy()) {
                    emit (*it)->signalTaskCome(item);
                }
            }

        } catch(const std::exception &e) {
            throw e;
        }
    }
}