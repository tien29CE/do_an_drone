template<class ITEM>
void SafeQueue<ITEM>::enqueue(ITEM &&item)
{
    std::unique_lock lock(this->m_mutex);
    this->m_cv.wait(lock, [this]{ return this->m_queue.size() <= MAX_QUEUE_SIZE; });

    this->m_queue.emplace_back(std::move(item));

    this->m_cv.notify_one();
}

template<class ITEM>
ITEM SafeQueue<ITEM>::dequeue()
{
    std::unique_lock lock(this->m_mutex);
    this->m_cv.wait(lock, [this]{ return !this->m_queue.empty(); });

    auto item = this->m_queue.front();
    this->m_queue.pop_front();

    return item;
}