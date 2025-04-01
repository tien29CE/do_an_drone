file(GLOB_RECURSE DRONE_SRC "*.cpp" "*.c" "*.h" "*.inl"
    "${CMAKE_CURRENT_SOURCE_DIR}/*.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/*.h"
    "${CMAKE_CURRENT_SOURCE_DIR}/*.inl"
)

add_executable(${PROJECT_NAME} main.cpp)

target_sources(${PROJECT_NAME} PRIVATE ${DRONE_SRC})

find_package(Qt6 REQUIRED COMPONENTS Core WebSockets)

target_link_libraries(${PROJECT_NAME} Qt6::Core Qt6::WebSockets)