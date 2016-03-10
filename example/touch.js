//Pressing W
camera.cameraDirection = camera.cameraDirection.add(new BABYLON.Vector3(0, 0, 0.1));
//Pressing S
camera.cameraDirection = camera.cameraDirection.add(new BABYLON.Vector3(0, 0, -0.1));
//Pressing A
camera.cameraDirection = camera.cameraDirection.add(new BABYLON.Vector3(-0.1, 0, 0));
//Pressing D
camera.cameraDirection = camera.cameraDirection.add(new BABYLON.Vector3(0.1, 0, 0));
//The rotation is done by creating mouse variable:
var mouse = new BABYLON.Vector2();
function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function yourRenderFunction() {
    if (mouse.x > 0.7 || mouse.x < -0.7 || mouse.y > 0.7 || mouse.y < -0.7) {
        camera.rotation = camera.rotation.add(new BABYLON.Vector3((-mouse.y) / 100, 0, 0));
        camera.rotation = camera.rotation.add(new BABYLON.Vector3(0, (mouse.x) / 100, 0));
    }
}
