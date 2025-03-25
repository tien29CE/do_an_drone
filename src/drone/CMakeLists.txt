file(GLOB_RECURSE DRONE_SRC "*.cpp" "*.c"
    "${CMAKE_CURRENT_SOURCE_DIR}/*.cpp"
)

add_executable(${PROJECT_NAME} main.cpp)

target_sources(${PROJECT_NAME} PRIVATE ${DRONE_SRC})

find_package(Qt6 REQUIRED COMPONENTS Core WebSockets)

target_link_libraries(${PROJECT_NAME} Qt6::Core Qt6::WebSockets)