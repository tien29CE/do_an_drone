file(GLOB_RECURSE DRONE_SRC "*.cpp" "*.c" "*.h" "*.inl")

add_executable(${PROJECT_NAME} main.cpp)

target_sources(${PROJECT_NAME} PRIVATE ${DRONE_SRC})

find_package(Qt6 REQUIRED COMPONENTS Core WebSockets)

include_directories(
    ${CMAKE_SOURCE_DIR}/src/3rdparty/boost
    ${CMAKE_SOURCE_DIR}/src/3rdparty/vcpkg/installed/x64-windows/include
)

target_link_libraries(${PROJECT_NAME}
    Qt6::Core
    Qt6::WebSockets
    ${CMAKE_SOURCE_DIR}/src/3rdparty/vcpkg/installed/x64-windows/lib/proj.lib
)