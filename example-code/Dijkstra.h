 #pragma once
 #include <vector>
 #include "Point.h"
 #include "PointSet.h"
 #include <qjsonarray.h>
 #include "ui_Dinkla.h"
 #include <limits>
 
 namespace DijkstraInternal {
     struct Edge : public QVector2D {
         unsigned int edgeId;
         unsigned int startPointId;
         unsigned int endPointId;
 
         QVector2D exactStart;
         QVector2D exactEnd;
 
         Edge() : startPointId{ 0 }, endPointId{ 0 } {};
         Edge(float xpos, float ypos) : startPointId{ 0 }, endPointId{ 0 }, QVector2D{ xpos, ypos } {};
         Edge(const QPointF& point) : startPointId{ 0 }, endPointId{ 0 }, QVector2D{ point } {};
         Edge(const QVector2D& point) : startPointId{ 0 }, endPointId{ 0 }, QVector2D{ point } {};
         Edge(const unsigned int startPointId, const unsigned int endPointId, QVector2D & exactStart, QVector2D & exactEnd, const QVector2D& edge) 
             : startPointId{ startPointId }, endPointId{ endPointId }, exactStart{ exactStart }, exactEnd { exactEnd }, QVector2D{ edge } {};
 
         //Edge(Edge && other) : startPointId{ other.startPointId }, endPointId{ other.endPointId }, exactStart{ other.exactStart }, exactEnd{ other.exactEnd }, QVector2D{ other.exactEnd - other.exactStart } {};
         //Edge(Edge const & other) : startPointId{ other.startPointId }, endPointId{ other.endPointId }, exactStart{ other.exactStart }, exactEnd{ other.exactEnd }, QVector2D{ exactEnd - exactStart } {};
         //Edge(Edge & other) : startPointId{ other.startPointId }, endPointId{ other.endPointId }, exactStart{ other.exactStart }, exactEnd{ other.exactEnd }, QVector2D{ other.exactEnd - other.exactStart } {};
 
         void write(QJsonObject& json, QString color = "red", int width = 3) const {
 
             QJsonObject line{};
             line["color"] = QString(color);
             line["width"] = width;
             json["line"] = line;
 
             QJsonArray path;
 
             QJsonObject obj;
             obj["latitude"] = exactStart.x();
             obj["longitude"] = exactStart.y();
             path.append(obj);
 
             QJsonObject end;
             end["latitude"] = exactEnd.x();
             end["longitude"] = exactEnd.y();
             path.append(end);
             
             /*
             std::for_each(pointVec.begin(), pointVec.end(), [&path](Point p) {
                 QJsonObject obj;
                 p.write(obj);
                 path.append(obj);
                 });
             */
             json["path"] = path;
         }
 
         unsigned int const getOtherId(unsigned int id) const {
             return id == startPointId ? endPointId : startPointId;
         }
 
         inline void assignId() {
             edgeId = baseId++;
         }
 
     private:
         static unsigned int baseId;
     };
 
     struct PathMatrix {
         unsigned int setId;
         //unsigned int pointId;
 
         //dijkstra matrix
         std::map<unsigned int, std::vector<Edge *>> pointIdToEdges;
         std::map<unsigned int, Edge*> edgeIdToEdge;
 
         std::vector<std::unique_ptr<Edge>> edges;
 
         inline void addEdgeToMatrix(std::unique_ptr<Edge> edge) {
             edge->assignId();
 
             auto it = pointIdToEdges.find(edge->startPointId);
             if (it == pointIdToEdges.end()) {
                 pointIdToEdges.emplace(std::make_pair(edge->startPointId, std::vector<Edge*>{ edge.get() }));
             } else {
                 it->second.push_back(edge.get());
             }
             it = pointIdToEdges.find(edge->endPointId);
             if (it == pointIdToEdges.end()) {
                 pointIdToEdges.emplace(std::make_pair(edge->endPointId, std::vector<Edge*>{ edge.get() }));
             } else {
                 it->second.push_back(edge.get());
             }
 
             edgeIdToEdge[edge->edgeId] = edge.get();
 
             edges.push_back(std::move(edge));
         }
 
         void write(QJsonObject& json) const {
             QJsonArray edgeList;
             for (auto& e : edges) {
                 QJsonObject obj;
                 e->write(obj);
                 edgeList.append(obj);
 
             }
             json["edge_list"] = edgeList;
         }
     };
 
     struct DijkstraMatrix {
         
         //DijkstraMatrix(DijkstraMatrix&& other) : setId{ other.setId }, pointId{ other.pointId },
          //   pointIdToCost{ other.pointIdToCost }, pointIdToPreviousEdgeIndex{ other.pointIdToPreviousEdgeIndex } {};
 
         unsigned int setId;
         unsigned int pointId;
 
         std::map<unsigned int, double> pointIdToCost;
 
         std::map<unsigned int, unsigned int> pointIdToPreviousEdgeIndex;
     };
 
     struct EdgeStruct {
         double cost;
         unsigned int pointToConnect;
         unsigned int setId;
 
         DijkstraMatrix* dijkstraMatrix;
 
         std::vector<Edge*> takenEdges;
 
         EdgeStruct(double cost, unsigned int pointToConnectId, unsigned int setId, DijkstraMatrix* dijkstraMatrix) : cost{ cost }, pointToConnect{ pointToConnectId }, setId{ setId }, dijkstraMatrix{ dijkstraMatrix } {};
 
         bool operator< (EdgeStruct const& other) {
             return cost < other.cost;
         }
 
         inline void write(QJsonArray& json, std::vector<PointSet *> rawSets) const {
             QString color = "red";
             int radius = 3;
             for (PointSet* set : rawSets) {
                 if (set->getId() == setId) {
                     color = set->getColourCode().c_str();
                     radius = (int) set->getRadius();
                     break;
                 }
             }
 
             Edge* prevEdge = nullptr;
             for (auto& e : takenEdges) {
                 //if there is a previous edge, connect them
                 if (prevEdge != nullptr) {
                     std::unique_ptr<Edge> connector = std::make_unique<Edge>();
                     //get the closest two points
                     float minDist = prevEdge->exactEnd.distanceToPoint(e->exactStart);
                     connector->exactStart = prevEdge->exactEnd;
                     connector->exactEnd = e->exactStart;
                     float dist = prevEdge->exactEnd.distanceToPoint(e->exactEnd);
                     if (dist < minDist) {
                         minDist = dist;
                         connector->exactStart = prevEdge->exactEnd;
                         connector->exactEnd = e->exactEnd;
                     }
                     dist = prevEdge->exactStart.distanceToPoint(e->exactStart);
                     if (dist < minDist) {
                         minDist = dist;
                         connector->exactStart = prevEdge->exactStart;
                         connector->exactEnd = e->exactStart;
                     }
                     dist = prevEdge->exactStart.distanceToPoint(e->exactEnd);
                     if (dist < minDist) {
                         minDist = dist;
                         connector->exactStart = prevEdge->exactStart;
                         connector->exactEnd = e->exactEnd;
                     }
 
                     QJsonObject obj;
                     connector->write(obj, color, radius);
                     json.append(obj);
                 }
                 prevEdge = e;
                 QJsonObject obj;
                 e->write(obj, color, radius);
                 json.append(obj);
 
             }
 
         }
     };
 
     struct ConnectivityManager {
         ConnectivityManager() : setId{ 0 }, elemCount{ 0 } {};
         ConnectivityManager(unsigned int const setId, unsigned int const elemCount) : setId{ setId }, elemCount{ elemCount } {};
 
         unsigned int setId;
         unsigned int elemCount;
         std::vector<std::set<unsigned int>> connectedPointIds;
 
         bool const isFullyConnected() const {
             if (connectedPointIds.begin() == connectedPointIds.end()) {
                 return false;
             }
             return elemCount == connectedPointIds.begin()->size();
         }
 
         bool updateConnectivityManager(unsigned int const startId, unsigned int const endId) {
             connectedPointIds.push_back(std::set<unsigned int> {startId, endId});
             for (auto it = connectedPointIds.begin(); it != connectedPointIds.end(); it++) {
                 if (it->count(startId) > 0 || it->count(endId) > 0) {
                     it->insert(startId);
                     it->insert(endId);
                     if (it != connectedPointIds.begin()) {
                         //check if the first entry and this entry have at least a single id in common
                         std::set<unsigned int> beginEntries = *connectedPointIds.begin();
                         std::set<unsigned int> currentEntries = *it;
                         bool areConnected = false;
                         for (unsigned int entry : beginEntries) {
                             if (currentEntries.count(entry) > 0) {
                                 areConnected = true;
                                 break;
                             }
                         }
                         if (areConnected)
                         {
                             connectedPointIds.begin()->insert(it->begin(), it->end());
                             it = connectedPointIds.erase(it);
                             --it;
                         }
                     }
                 }
             }
             return elemCount == connectedPointIds.begin()->size();
         }
     };
 
 }
 
 class Dijkstra {
 public:
     Dijkstra();
     ~Dijkstra();
 
     void initializeBasicPathMatrix(const std::vector<Point *> points, const std::vector<PointSet *> sets);
 
     inline void drawBaseMatrix(QObject* mapObject, unsigned int index = 0) {
         auto it = setIdTobasePaths.find(index);
         if (it != setIdTobasePaths.end()) {
             DijkstraInternal::PathMatrix const * const mat = it->second.get();
             QJsonObject obj;
             mat->write(obj);
             //TODO: generally, remove hard-coded strings for the qml method calls
             QMetaObject::invokeMethod(mapObject, "drawPathMatrix", Q_ARG(QVariant, obj));
         }
     }
 
     std::vector<DijkstraInternal::EdgeStruct> computeEdges(std::vector<Point*> rawPoints, std::vector<PointSet*> rawSets);
     
     inline void setCircleRadiusInMetres(int radius) {
         circleRadiusInMetres = radius;
     }
 
 private:
 
     std::map<unsigned int, std::map<unsigned int, std::unique_ptr<DijkstraInternal::DijkstraMatrix>>> setIdToPointIdToDijkstraMatrix;
 
     std::map<unsigned int, std::unique_ptr<DijkstraInternal::PathMatrix>> setIdTobasePaths;
 
     int circleRadiusInMetres;
 
     void computeSetMatrices(std::vector<Point*> rawPoints, std::vector<PointSet*> rawSets, std::vector<DijkstraInternal::EdgeStruct> takenEdges);
 
     //returns nullptr if the edge intersects a point in points
     std::unique_ptr<DijkstraInternal::Edge> getEdgeIfNotIntersecting(Point& start, Point& end, const std::vector<Point *> points);
 
     inline QVector2D getBaseOrthogonalVector(const QVector2D& vec) {
         return QVector2D{ vec.y(), -vec.x() };
     };
 
     inline QVector2D getOtherOrthogonalVector(const QVector2D& vec) {
         return QVector2D{ -vec.y(), vec.x() };
     };
 
     inline std::unique_ptr<DijkstraInternal::Edge> getTangent(QGeoCoordinate const & centre, Point* const p, Point * const other,
             QVector2D orthogonalVector, std::vector<Point *> points) {
         Point tangentOneHelper{ *other + orthogonalVector };
         QGeoCoordinate const tangOne{ tangentOneHelper.x(), tangentOneHelper.y() };
 
         qreal const azimuthTangOne = centre.azimuthTo(tangOne);
 
         QGeoCoordinate const tangentPointOne = centre.atDistanceAndAzimuth(circleRadiusInMetres, azimuthTangOne);
         //add tangent edge
         return std::move(getEdgeIfNotIntersecting(*p, Point(tangentPointOne, other->getId()), points));
     }
 
     inline std::unique_ptr<DijkstraInternal::Edge> getComplicatedTangent(QVector2D direct, Point * const p, Point * const other,
             std::vector<Point *> points, bool isFirstBase, bool isSecondBase) {
         QVector2D ortho = isFirstBase ? getBaseOrthogonalVector(direct) : getOtherOrthogonalVector(direct);
 
         QGeoCoordinate const centre = other->getAsGeoCoordinate();
         QGeoCoordinate const pCentre = p->getAsGeoCoordinate();
 
         Point tangentPHelper{ *p + ortho };
         QGeoCoordinate const tangP = tangentPHelper.getAsGeoCoordinate();
 
         qreal const azimuthTangP = pCentre.azimuthTo(tangP);
 
         QGeoCoordinate const tangentPointOne = pCentre.atDistanceAndAzimuth(circleRadiusInMetres, azimuthTangP);
         Point otherP{ tangentPointOne, p->getId() };
 
         return std::move(getTangent(centre, &otherP, other, 
             isSecondBase ? getBaseOrthogonalVector(direct) : getOtherOrthogonalVector(direct), points));
 
     }
 
     std::unique_ptr<DijkstraInternal::DijkstraMatrix> computeDijkstraMatrixForPoint(unsigned int const setId, std::vector<Point*> points, unsigned int const startingPointIndex, std::vector<DijkstraInternal::EdgeStruct> takenEdges) const;
 
     bool intersectsPreviousEdge(DijkstraInternal::Edge * toAdd, std::vector<DijkstraInternal::EdgeStruct> edgesToAdd) const;
 };
 