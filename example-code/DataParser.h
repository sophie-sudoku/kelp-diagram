 #pragma once
 #include <string>
 #include <vector>
 #include "PointSet.h"
 #include "Point.h"
 
 class DataParser
 {
 public:
     DataParser();
     ~DataParser();
 
 
     void loadSetDataFromFile(std::vector< std::unique_ptr<Point>>& points, std::vector<std::shared_ptr<PointSet>>& sets, const std::string filepath, unsigned int const dataset = 0) const;
 
 private:
 
     std::vector<Point> locations;
 
     std::vector<std::vector<unsigned int>> pointToSet;
 
     inline void linkPointAndSet(Point * p, std::shared_ptr<PointSet> s) const {
         s->addIndex(p->getId());
         p->addToPointSet(s);
     }
 };
 