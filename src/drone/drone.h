#include <QtCore/QObject>
#include <QtCore/QList>
#include <QtCore/QThread>

class Drone : public QObject
{
    Q_OBJECT

public:
    Drone(QObject *parent);
    ~Drone();

private:
    QObject *m_parent;
    QList<std::shared_ptr<QThread>> m_workers;
};