import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui'
import { AdvancedDynamicTexture, Control, Button } from "@babylonjs/gui/2D";


class snapTrudeTool{
  canvas 
  camera
  scene
  engine
  groundPlane
  polygon = null
  isDrawMode
  isMoveMode
  isVertexEditing
  points
  depth
  gizmoManager
  selectedVertexIndex = null

  // Defining all the parameters that have to initalised for the tool. 
  constructor(){
    this.canvas = canvas // Canvas is basic HTML Element where the BABAYLONJS tool is rendered.
    this.scene = new BABYLON.Scene(engine); //This is the second basic element where all the objects are places and rendered. 
    this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), this.scene); //This is a view point from which the user can see 3D space.
    this.isDrawMode = false;
    this.isMoveMode = false;
    this.isVertexEditing = false;
    this.points = []
    this.depth = 1 //Hard coding the height of the extruded shape
    this.polygon = null
    this.selectedVertexIndex = null
    this.createScene(); //Initialise a scene and render all the objects. 

  }

  createScene(){

    // Defining the camera position in the scene
    this.camera.setPosition(new BABYLON.Vector3(6, 12, 30));
    this.camera.attachControl(canvas,true);
    this.camera.upperBetaLimit = Math.PI / 2;

    //Creating a ground plane with height and width in the scene and defining the material that has to be rendered.
    this.groundPlane = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10,subdivisions:10}, this.scene);
    this.groundPlane.material = new BABYLON.StandardMaterial();
    this.groundPlane.material.wireframe = true;

    // Defining the light in the scene to view objects, this helps in how the objects have to rendered.
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(3, 1.5, 0), this.scene);
    light.intensity = 0.7;

    // Creating a pannel of buttons and adding them in the scene 
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const UiPanel = new GUI.StackPanel();
    UiPanel.width = "600px";
    UiPanel.height = "100px";
    UiPanel.isVertical = false;
    UiPanel.horizontalAllignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    UiPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(UiPanel);

    // Addiing button to enter Draw Mode and defining the actions.
    var draw2DButton = GUI.Button.CreateSimpleButton("draw2DButton", "Draw");
    draw2DButton.paddingTop = "10px";
    draw2DButton.width = "100px";
    draw2DButton.height = "50px";
    draw2DButton.color = "white";
    draw2DButton.background = "green";
    UiPanel.addControl(draw2DButton);
    draw2DButton.onPointerDownObservable.add( () => {
          if(this.isDrawMode == true){
            draw2DButton.background = "green";
            this.isDrawMode = false
          }else{
            draw2DButton.background = "red";
            // alert('Drawing Mode')
            this.isDrawMode = true
            this.draw2D(this.isDrawMode,this.points)
          }
    });

    // Adding button to extrude once the 2D object drawn on the ground plane.
    var extrude3DButtom = GUI.Button.CreateSimpleButton("draw2DButton", "Extrude");
    extrude3DButtom.paddingTop = "10px";
    extrude3DButtom.width = "100px";
    extrude3DButtom.height = "50px";
    extrude3DButtom.color = "white";
    extrude3DButtom.background = "green";
    UiPanel.addControl(extrude3DButtom);
    extrude3DButtom.onPointerDownObservable.add( () => {
      if(this.points){
        this.extrude3D(this.points, this.depth);
        this.points = []
      }
    });

    // Adding button to activate move mode, user can move the 3D objects on the ground plane
    var move3DButton = GUI.Button.CreateSimpleButton("draw2DButton", "Move");
    move3DButton.paddingTop = "10px";
    move3DButton.width = "100px";
    move3DButton.height = "50px";
    move3DButton.color = "white";
    move3DButton.background = "green";
    UiPanel.addControl(move3DButton);
    move3DButton.onPointerDownObservable.add(() =>{
      if(this.isMoveMode == true){
        move3DButton.background = "green";
        this.isMoveMode = false;
        this.moveMesh(this.isMoveMode);
      }else{
        move3DButton.background = "red";
        this.isMoveMode = true;
        this.moveMesh(this.isMoveMode);
      }
    })

    // Adding button to activate edit vertex mode
    var editVertexButton = GUI.Button.CreateSimpleButton("draw2DButton", "Edit Vertex");
    editVertexButton.paddingTop = "10px";
    editVertexButton.width = "100px";
    editVertexButton.height = "50px";
    editVertexButton.color = "white";
    editVertexButton.background = "green";
    UiPanel.addControl(editVertexButton);
    editVertexButton.onPointerDownObservable.add(() => {
      if(this.isVertexEditing == false){
        editVertexButton.background = "red";
        this.isVertexEditing = true;
        this.editMesh(this.isVertexEditing)
      }else if(this.isVertexEditing == true){
        editVertexButton.background = "green";
        this.isVertexEditing = false;
      }
    });
  }


  // This function captures the XZ coordinates of pointer on the ground plane and stores them in point array. 
  // On left click the points are added to the array so that the user can input next points
  // On right click the inital points is pushed to points array, which forms a closed 2D shape. 
  draw2D(isDrawMode,points){
      console.log("test")
      this.scene.onPointerUp  = function(p,pick){
        if(isDrawMode && pick.hit && p.button == 0){
          points.push(new BABYLON.Vector3(pick.pickedPoint.x, 0, pick.pickedPoint.z));
        }else if(isDrawMode && pick.hit && p.button == 2){
          points.push(points.at(0));
          isDrawMode = false;
          this.isDrawMode = isDrawMode;
          this.points = points
        }

        // To make it more user interactive, if there are more than 2 points, 
        // we draw line between the last two points this way user can visualise the 2D object in real time. 
        if(points.length >=2 ){
          const lineEndPoints = [
          points.at(points.length - 2),
            points.at(points.length - 1)
          ] //Define end points of a line
          const line = BABYLON.MeshBuilder.CreateLines("lines",{
            points: points
          }, this.scene); //build the line in the scene.
          line.color = new BABYLON.Color3(1,0,0)
        }
      }

    }


  //This function supports in extruding 3D polygon from the previously drawn 2D shape
  extrude3D(points,depth){
    if(points.length < 3){
      alert("In-sufficient points for extrude process");
      return
    }
    this.polygon = BABYLON.MeshBuilder.ExtrudePolygon("polygon", {
        shape: points,
        depth: depth, 
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        updatable:true,
        wrap:true,
      }, this.scene); //The points array gives all points of a 2D polygon from these points we build a mesh by extruding the 2D shape onto Y axis. This creates a 3d extruded polygon. 
    this.polygon.position.y = depth // To place the extruded polygon on top of the ground plane, we move the position by depth times on y-axis
    this.polygon.material = new BABYLON.StandardMaterial("mat", this.scene);
    this.polygon.material.diffuseColor = new BABYLON.Color3(1,1,1); //This defines the color of the extruded polygon. 
    this.points = [];
  }



  // This function helps to update the mesh coordinates on moving the vertices of 3D polygon.
  updateMesh(mesh, vertexIndex, offset){
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind); //Get an array of vertices of the extruded object
    // The positions array is defined as [x0,y0,z0,x1,y1,x1,x2,y2,z2]
    // x0,y0,z0 together deine a point on the extruded polygon. We always process the array accordingly.

    const vertexPos = {
      x: positions[vertexIndex * 3],
      y: positions[vertexIndex * 3 + 1],
      z: positions[vertexIndex * 3 + 2]
    };

    // Update the position of the selected vertex
    positions[vertexIndex * 3] += offset.x;
    positions[vertexIndex * 3 + 1] += offset.y;
    positions[vertexIndex * 3 + 2] += offset.z;

    // Update the positions of all corresponding vertices on the extruded sides
    for (let i = 0; i < positions.length; i += 3) {
        if (positions[i] === vertexPos.x && positions[i + 2] === vertexPos.z && i !== vertexIndex * 3) {
            positions[i] += offset.x; //Add the offset distance of x y & z accordingly.
            positions[i + 1] += offset.y;  
            positions[i + 2] += offset.z;
        }
    }

    mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true); //Update the extruded polygon with the new positions.

    // Calculate the normals so that rendering of the object is correct. 
    var normals = [];
    BABYLON.VertexData.ComputeNormals(positions, mesh.getIndices(), normals);
    mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    mesh.refreshBoundingInfo();
  }


  // On pointer click on the mesh, we try to find the nearest vertex from pointer position and then try to move then try 
  // edit the vertex positions accordingly. 
  getClosestVertexIndex(pickInfo){
    const mesh = pickInfo.pickedMesh //get the mesh that was picked by the pointer
    const vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind); //Fetch all the vertices of the mesh from the VertexBuffer

    let minDistance = Infinity;
    let closestVertexIndex = -1;
    // We calculate the inverse of the world matrix of the picked mess and then try to find the coordinate of the picked point in local space. 
    var localPickedPoint = BABYLON.Vector3.TransformCoordinates(pickInfo.pickedPoint, BABYLON.Matrix.Invert(pickInfo.pickedMesh.getWorldMatrix())); 

    // We calculate distance from the vertices and find the minDistance and index of the closest vertex
    if (vertices) {
      for (let i = 0; i < vertices.length; i += 3) {
          let vertex = new BABYLON.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
          let distance = BABYLON.Vector3.DistanceSquared(vertex, localPickedPoint);
          if (distance < minDistance) {
              minDistance = distance;
              closestVertexIndex = i / 3;
          }
      }
    } 
    return closestVertexIndex

  }
  
  // This function helps in editing the vertices of the 3D shape, 
  // which also deforms the shape of the extruded object accordingly. 
  // STEP 1: On pointer click we find the index of the closest vertex to the clicked location.
  //         Local position of the pointer click position is calculated and camera is detached.
  // STEP 2 : On pointer movement we calculate the local ponit position in real time 
  //          We then find the offset from the original location of the point in 3D space
  //          The mesh coordinates are updated accoridingly.
  // STEP 3 : On pointer up we attach the camera back and freeze the shape of the mesh, till next pointer movement. 
  editMesh(){
    // if(!this.isVertexEditing) return; Check if we are in the vertex editing mode
    const positions = this.polygon.getVerticesData(BABYLON.VertexBuffer.PositionKind); 

    // We define an observer on the scene, when the pointer in clicked we perform the following actions.
    this.scene.onPointerDown = ((p, pick) => {

      var pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY); //Get info of the picked point [ex : picked mesh, picked point and faceId]
      if(pickInfo && pickInfo.pickedMesh.name != "ground" && this.isVertexEditing){
        pickInfo.pickedMesh.material.diffuseColor = new BABYLON.Color3(0.25,0.25,1); //To give a visual representaiton of the editing object, we change the color of the object when it is being edited.
        pickInfo.pickedMesh.isPickable = true;
        const closestVertexIndex = this.getClosestVertexIndex(pickInfo); //We then find the index of the closest vertex to the picked point.
        console.log("closet Vertex", closestVertexIndex);

        //we then find the coordinates of the picked point in local space
        var localPickedPoint =BABYLON.Vector3.TransformCoordinates(pickInfo.pickedPoint, BABYLON.Matrix.Invert(pickInfo.pickedMesh.getWorldMatrix()));
        this.selectedVertexIndex = {index : closestVertexIndex, mesh : pickInfo.pickedMesh, originalPositions : localPickedPoint}
        this.camera.detachControl(this.canvas) //We freeze the camera so that it is comfortable for user to edit.

      }
    });

    // Once clicked and the pointer is moving we perform the following actions
    this.scene.onPointerMove = ((evt) => {
      if (this.selectedVertexIndex && this.isVertexEditing){
        var pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY); //we get the information of the moving pointer
      
        if (pickResult.hit && pickResult.pickedPoint && this.selectedVertexIndex) {
            var mesh = this.selectedVertexIndex.mesh;
            var worldPickedPoint = pickResult.pickedPoint;
            var localPickedPoint = BABYLON.Vector3.TransformCoordinates(worldPickedPoint, BABYLON.Matrix.Invert(mesh.getWorldMatrix()));
            console.log('local Posint',localPickedPoint, this.selectedVertexIndex.originalPositions);

            let offset = localPickedPoint.subtract(this.selectedVertexIndex.originalPositions); //We calculate the offset from moving vertex to the originalPosition of the vertex
            this.updateMesh(mesh, this.selectedVertexIndex.index, offset); //we then update the mesh accordingly in real time. 

            this.selectedVertexIndex.originalPositions = localPickedPoint; // Update the original position
        }
      }
    });

    //Once the pointer is released, we change back the color to original 
    // we re-attach the camera. 
    this.scene.onPointerUp = ((evt1) => {
      console.log('up')
      var pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
      if(this.selectedVertexIndex && this.isVertexEditing){
        console.log(pickResult);
        pickResult.pickedMesh.material.diffuseColor = new BABYLON.Color3(1,1,1);
        console.log('up-inside')
        this.selectedVertexIndex = null;
        this.camera.attachControl(true);
      }
    });
  }

  // The following function helps in update the mesh data as we move. 
  moveUpdateMesh(mesh,offset){
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind); //get position of the mesh

    // Update all x and y coordinate of the position according to the offset of movement in the object
    for(var i=0;i<positions.length;i+=3){
      positions[i] += offset.x ;
      // positions[i+1] += offset.y; We do not update y so that we can restrict the movement on 2D ground plane. 
      positions[i+2] += offset.z;
    }

    //The vertice is rendered with the new position and the normals are computed. 
    mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions,true); 
    var normals = [];
    BABYLON.VertexData.ComputeNormals(positions, mesh.getIndices(), normals);
    mesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    mesh.refreshBoundingInfo();
  }

  //This function helps in implementing the move functionality:
  //STEP 1 : On pointer click we check which mesh is picked up and we calculate the local position of the object before moving and detach the camera.
  //STEP 2 : On pointer movement we check in real-time the local position of the pointer and we calculate the offset form the original position of the mesh, 
  //         and update the mesh accoridngly in real-time
  // STEP3 : On pointer up we attach the camera back and the movement of the object is freezed. 
  moveMesh(){
    if(this.isMoveMode){

      this.scene.onPointerDown = ((p,pick) => {
        var pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        if(pickInfo && pickInfo.pickedMesh != "ground" && this.isMoveMode){
          pickInfo.pickedMesh.isPickable = true;
          pickInfo.pickedMesh.material.diffuseColor = new BABYLON.Color3(0.25,0.25,1);

          var localPickedPoint = BABYLON.Vector3.TransformCoordinates(pickInfo.pickedPoint,BABYLON.Matrix.Invert(pickInfo.pickedMesh.getWorldMatrix()));
          this.selectedVertexIndex = {mesh : pickInfo.pickedMesh,originalPositions:localPickedPoint};
          console.log(localPickedPoint);
          this.camera.detachControl(this.camera);
        }
      });

      this.scene.onPointerMove = ((evt) =>{
        if(this.selectedVertexIndex && this.isMoveMode){
          var pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

          if(pickResult.hit && pickResult.pickedPoint && this.selectedVertexIndex){
            var mesh = this.selectedVertexIndex.mesh;
            var worldPickedPoint = pickResult.pickedPoint;
            var localPickedPoint = BABYLON.Vector3.TransformCoordinates(worldPickedPoint,BABYLON.Matrix.Invert(mesh.getWorldMatrix()));

            let offset = localPickedPoint.subtract(this.selectedVertexIndex.originalPositions);
            this.moveUpdateMesh(mesh, offset);

            this.selectedVertexIndex.originalPositions = localPickedPoint;
          }
        }
      });

      this.scene.onPointerUp = ((evt) => {
        var pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        if(this.selectedVertexIndex && this.isMoveMode){
          pickInfo.pickedMesh.material.diffuseColor = new BABYLON.Color3(1,1,1);
          this.selectedVertexIndex = null;
          this.camera.attachControl(true);
        }
      })

    }
  }

  // This function helps in returning the scene. 
  getScene(){
    return this.scene;
  }


}

const canvas = document.getElementById('renderCanvas'); //Deine a canvas on the HTML Page. 
const engine = new BABYLON.Engine(canvas); //Define a rendering engine 
const snapTrude = new snapTrudeTool(engine,canvas); //Create an object from the SnapTrudeTool class. 
const snapTrudeScene = snapTrude.getScene(); //Fetch the scene from the object. 

// Render teh sceen on the canvas.
engine.runRenderLoop(function(){
  snapTrudeScene.render();
})



