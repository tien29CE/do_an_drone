#include "drone.h"

Drone::Drone(QObject *parent)
    : QObject(parent)
    , m_parent(parent)
{}

Drone::~Drone()
{
    delete m_parent;
}