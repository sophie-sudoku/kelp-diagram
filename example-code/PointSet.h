 #pragma once
 #include <set>
 #include <string>
 
 class PointSet
 {
 public:
     PointSet();
     ~PointSet();
 
     const std::set<unsigned int> getContainedIndices() const;
 
     void addIndex(const unsigned int index);
 
     void setColourCode(const std::string colourCode);
 
     void setRadiusFactor(double const factor) {
         radiusFactor = factor;
     }
 
     void setRadius(double const radius) {
         this->radius = radiusFactor * radius;
     }
 
     inline double const getRadius() const {
         return radius;
     }
 
     inline std::string const getColourCode() const { return colourCode; }
 
     inline unsigned int const getId() const {
         return id;
     }
 
     inline bool const pointIdIsInSet(const unsigned int pointId) const {
         return containedIndices.count(pointId) > 0;
     }
 
 private:
     static unsigned int baseId;
 
     const unsigned int id;
 
     std::set<unsigned int> containedIndices;
 
     std::string colourCode;
 
     double radiusFactor = 1.0;
 
     double radius;
 };