#include <list>
#include <condition_variable>
#include <mutex>

#define MAX_QUEUE_SIZE      20

template<class ITEM>
class SafeQueue
{
public:
    SafeQueue() = default;
    ~SafeQueue() = default;
    void enqueue(ITEM &&item);
    ITEM dequeue();

private:
    std::list<ITEM> m_queue;
    std::condition_variable m_cv;
    std::mutex m_mutex;
};

#include "safe_queue.inl"