#pragma once
 #include "DataParser.h"
 #include "ui_Dinkla.h"
 #include "Dijkstra.h"
 
 class Dinkla : public QObject
 {
     Q_OBJECT
 
 public:
     Dinkla(QObject *parent = Q_NULLPTR);
 
     Q_INVOKABLE void testCallFromQml(QObject* map);
 
     Q_INVOKABLE void changeDataset(int dataset);
 
     void setMapObject(QObject* map) {
         this->mapObject = map;
     }
 
 private:
     Ui::DinklaClass ui;
 
     QObject* mapObject;
 
     std::unique_ptr<DataParser> dataParser;
 
     void parseAndForwardPoints(const QObject* map, int dataset = 0) const;
 
     void inline addPointToMap(const Point * point, double const radius) const;
 
     //TODO: remove EdgeStruct from Internal Namespace
     inline void drawEdgeStructs(QObject* mapObject, std::vector<DijkstraInternal::EdgeStruct> edgeStructList, std::vector<PointSet *> rawSets) const {
         QJsonObject obj;
         QJsonArray arr;
         std::map<unsigned int, QJsonArray> setIdToArray;
         for (PointSet* set : rawSets) {
             setIdToArray.insert(std::make_pair(set->getId(), QJsonArray{}));
         }
         //QJsonArray arr;
         for (DijkstraInternal::EdgeStruct& const edge : edgeStructList) {
             edge.write(setIdToArray.at(edge.setId), rawSets);
         }
         for (PointSet* set : rawSets) {
             QJsonArray tmp = setIdToArray.at(set->getId());
             for (auto elem : tmp) {
                 arr.push_back(elem);
             }
         }
         obj["edge_list"] = arr;
         //TODO: generally, remove hard-coded strings for the qml method calls
         QMetaObject::invokeMethod(mapObject, "drawPathMatrix", Q_ARG(QVariant, obj));
     }
 };