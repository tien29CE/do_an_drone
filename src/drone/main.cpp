#include <QtCore/QCoreApplication>
#include "drone.h"

int main(int argc, char* argv[]) {
	QCoreApplication app(argc, argv);

	Drone *drone = new Drone();

	return app.exec();
}