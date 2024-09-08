# snapTrude_Assignment | SDE Algorithms

As part of this assignment, I have developed a tool with a functinality to create a 2D shape on the ground plane and extrude thae 2D shape. 

The tool also gives us functionality to move the extruded object on the 2D plane and the vertice of the extruded object can be moved in the 3D space by diffusing the shape of the 3D object.

# Instruction to run Project :
```bash
npm install -D @babylonjs/core
npm install -D @babylonjs/gui
npm run Dev
```

# Functionality Requirments :

1. Use Babylon.js to create a 3D scene with a ground plane.

2.Implement functionality to allow the user to draw 2D shapes on the ground plane using mouse interactions (e.g., left-click to add points, right-click to complete the shape). Provide a "Draw" button to enter the draw mode.

3. Once the shape is completed (a closed loop), provide a UI element (e.g., button) to initiate the extrusion process. The extrusion height can be a fixed hard coded value.

4. Allow the user to move the extruded objects on the ground plane using mouse interactions (e.g., click and drag). Provide a "Move" button to enter move mode.

5. Implement functionality to edit the vertices of the extruded object using mouse interactions (e.g., click and drag to move vertices). All vertices of the shape should be editable (for example, a cuboid would have 8 editable vertices). The user should be able to freely move the vertices in 3D space. Provide a "Vertex Edit" button to enter vertex edit mode

6. Provide visual cues and UI elements to indicate the selected object and active editing mode (move or edit vertices).


# How to Use :
1. Entering Draw Mode
   1. Left click to place and point in the 2D plane
   2. Right click for the last point on the 2D plane to complete the 2D shape.
   3. Any orbitary shape can be drawn.
2. Extrude Mode : On clicking extrude, the 2D shape will be extruded with a fixed depth of 1 on the Y-Axis.
3. Move Mode 
     1. Click on the object that you want to move and drag to the the new location
     2. On releases the click the object is placed in the new location
     3. The pickedup mesh for moving is always displayed with blue color.
4. Edit Vertex Mode :
     1. Click on the vertex to move and drag to the new location.
     2. The object shape will deform according to the movement in real - time.
     3. On release of the click the object is freezed with the new shape.

Note : When the button is Red Color i.e functionality in active state

# Restictions & Scope for improvements:
1.  When an 2D object is created, we need to extrude the object before creating a new one. This restriction is because the same points array is used to store the 2D shape point location and for the extrustion of the polygon.
2.  The naming conventions of the variables & function name should be improved and try to keep as standard as possible.
3.  Improve error handling during vertex edit mode. 

# Improvement :
1. The draw 2D object restiction can be improved by using a DS to store all points of a 2D shape in a particular index, this way we can store multiple 2D shapes and then all the shaped can be extruded during the extrude process.
   

