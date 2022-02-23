 #pragma once
 #include <set>
 #include <memory>
 #include <vector>
 #include <qjsonobject>
 #include <QtGui/qvector2d.h>
 #include <QPointF>
 #include <QGeoCoordinate>
 #include "PointSet.h"
 
 class Point : public QVector2D {
 public:
     Point(qreal xpos, qreal ypos) : id{ baseId++ }, QVector2D(xpos, ypos) {};
     Point() : id{ 0 }, QVector2D() {};
     Point(const Point& p) : id{ p.getId() }, QVector2D(p) {};
     Point(const QVector2D& p) : id{ 0 }, QVector2D(p) {};
     Point(const QGeoCoordinate& coord, unsigned int const id) : id{ id }, QVector2D(coord.latitude(), coord.longitude()) {};
 
     Point(Point && other) : id{ other.getId() }, QVector2D(other) {};
 
     inline bool operator ==(const Point& other) { return id == other.getId(); }
 
      // need to make it return a vec of basic pointers
     const inline std::vector<std::shared_ptr<PointSet>> getPointSets() const { return sets; }
 
     const inline bool inSameSet(const Point& other) const
     {
         for (auto& id : this->pointSetIds) {
             if (other.pointSetIds.count(id) > 0)
                 return true;
         }
         return false;
     }
 
     inline bool const isInSet(unsigned int const setId) const {
         for (unsigned int id : this->pointSetIds) {
             if (setId == id) {
                 return true;
             }
         }
         return false;
     }
 
     void addToPointSet(const std::shared_ptr<PointSet> set);
 
     void write(QJsonObject& json) const;
 
     inline const unsigned int getId() const {
         return id;
     }
 
     inline QGeoCoordinate getAsGeoCoordinate() const {
         return QGeoCoordinate{ x(), y() };
     }
 
 private:
     static unsigned int baseId;
 
     const unsigned int id;
 
     std::set<unsigned int> pointSetIds;
 
     std::vector<std::shared_ptr<PointSet>> sets;
 };
 