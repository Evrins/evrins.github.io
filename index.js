var FlyingStone;
(function (FlyingStone) {
    var fps = document.getElementById('fps');
    var canvas = document.getElementById('stone');
    var engine = new BABYLON.Engine(canvas);
    var scene;
    var SCALE = canvas.clientWidth < canvas.clientHeight ? canvas.clientWidth / 100 : canvas.clientHeight / 100;
    var VISION_WIDTH = 150;
    var VISION_HEIGHT = 150;
    var MOVE_LIMIT_WIDTH = 200;
    var MOVE_LIMIT_HEIGHT = 200;
    var CAMERA_RADIUS = 2500;
    var START_TIME = 0;
    var ANIMATION_TIME = 5000;
    var STONE_COUNT = 18;
    var MODEL_COUNT = 9;
    var INTERVAL = 1000 / 60;
    var isRunning = false;
    var touchStartPoint = new BABYLON.Vector2(0, 0);
    var stoneList = [];
    var stoneInfoList = [];
    function showAxis(size, scene) {
        function makeTextPlane(text, color, size) {
            var dynamicTexture = new BABYLON.DynamicTexture('dt', 40, scene, true);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(text, size * 0.05, size, 'bold 18px Arial', color, 'transparent', true);
            var planeMaterial = new BABYLON.StandardMaterial('textPlaneMaterial', scene);
            planeMaterial.backFaceCulling = false;
            planeMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            planeMaterial.diffuseTexture = dynamicTexture;
            var plane = BABYLON.Mesh.CreatePlane('textPlane', size, scene, true);
            plane.material = planeMaterial;
            return plane;
        }
        var axisX = BABYLON.Mesh.CreateLines('axisX', [
            BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(size, 0, 0),
            new BABYLON.Vector3(size * 0.95, size * 0.05, 0),
            new BABYLON.Vector3(size, 0, 0),
            new BABYLON.Vector3(size * 0.95, size * 0.05, 0)
        ], scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var charX = makeTextPlane('X', 'red', size);
        charX.position = new BABYLON.Vector3(size * 0.9, -size * 0.05, 0);
        var axisY = BABYLON.Mesh.CreateLines('axisY', [
            BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(0, size, 0),
            new BABYLON.Vector3(-size * 0.05, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0),
            new BABYLON.Vector3(size * 0.05, size * 0.95, 0)
        ], scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var charY = makeTextPlane('Y', 'green', size);
        charY.position = new BABYLON.Vector3(0, size * 0.9, -size * 0.05);
        var axisZ = BABYLON.Mesh.CreateLines('axisZ', [
            BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(0, 0, size),
            new BABYLON.Vector3(0, size * 0.05, size * 0.95),
            new BABYLON.Vector3(0, 0, size),
            new BABYLON.Vector3(0, -size * 0.05, size * 0.95),
        ], scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        var charZ = makeTextPlane('Z', 'blue', size);
        charZ.position = new BABYLON.Vector3(0, size * 0.05, size * 0.9);
    }
    function moveAndRotate() {
        if (stoneList.length === STONE_COUNT) {
            var delta_1 = Date.now() - START_TIME;
            stoneList.forEach(function (stone, idx) {
                stone.position = getPosition(idx, delta_1);
                stone.rotation.x += Math.PI / 100 * Math.random();
                stone.rotation.y += Math.PI / 100 * Math.random();
                stone.rotation.z += Math.PI / 100 * Math.random();
            });
        }
    }
    function init() {
        scene = createScene(engine);
        engine.runRenderLoop(function () {
            if (scene) {
                scene.render();
            }
            fps.innerHTML = engine.getFps().toFixed() + " fps";
        });
        for (var i = 0; i < STONE_COUNT; i++) {
            var info = new StoneInfo(genRandomStartPoint(), genRandomEndPoint(), genRandomStartTime());
            stoneInfoList.push(info);
        }
        window.addEventListener('resize', function (evt) {
            engine.resize();
        });
        canvas.addEventListener('pointerdown', function (evt) {
            evt.preventDefault();
            touchStartPoint = new BABYLON.Vector2(evt.x, evt.y);
        });
        canvas.addEventListener('pointermove', function (evt) {
            evt.preventDefault();
            var camera = scene.getCameraByName('camera');
            var cameraPosition = camera.position;
            var cameraY = camera.position.y + evt.y - touchStartPoint.y;
            var cameraZ = camera.position.z + touchStartPoint.x - evt.x;
            touchStartPoint = new BABYLON.Vector2(evt.x, evt.y);
            if (cameraY >= -1 / 2 * MOVE_LIMIT_HEIGHT && cameraY <= 1 / 2 * MOVE_LIMIT_HEIGHT &&
                cameraZ >= -1 / 2 * MOVE_LIMIT_WIDTH && cameraZ <= 1 / 2 * MOVE_LIMIT_WIDTH) {
                camera.position = new BABYLON.Vector3(camera.position.x, cameraY, cameraZ);
                camera.setTarget(new BABYLON.Vector3(0, cameraY, cameraZ));
            }
        });
    }
    FlyingStone.init = init;
    function start() {
        if (scene && !isRunning) {
            START_TIME = Date.now();
            scene.registerBeforeRender(moveAndRotate);
            isRunning = true;
        }
    }
    FlyingStone.start = start;
    function end() {
        scene.unregisterBeforeRender(moveAndRotate);
        reset();
        isRunning = false;
    }
    FlyingStone.end = end;
    function reset() {
        if (!isRunning) {
            return;
        }
        stoneList.forEach(function (value, idx) {
            value.position = new BABYLON.Vector3(0, 0, 0);
        });
    }
    var StoneInfo = (function () {
        function StoneInfo(start, end, offset) {
            this.startPosition = start;
            this.endPosition = end;
            this.startTimeOffset = offset;
        }
        return StoneInfo;
    }());
    function getPosition(idx, delta) {
        var position = new BABYLON.Vector3(0, 0, 0);
        var stoneInfo = stoneInfoList[idx];
        var stone = stoneList[idx];
        var a = delta - stoneInfo.startTimeOffset;
        var b = a % ANIMATION_TIME;
        if (a > 0) {
            if (!stone.isVisible) {
                stone.isVisible = true;
            }
            var p = b / ANIMATION_TIME;
            var q = 1 - p;
            var x = stoneInfo.startPosition.x * q + stoneInfo.endPosition.x * p;
            var y = stoneInfo.startPosition.y * q + stoneInfo.endPosition.y * p;
            var z = stoneInfo.startPosition.z * q + stoneInfo.endPosition.z * p;
            position = new BABYLON.Vector3(x, y, z);
        }
        else {
            if (stone.isVisible) {
                stone.isVisible = false;
            }
        }
        if (b + INTERVAL + 10 > ANIMATION_TIME) {
            updateStoneInfo(idx);
        }
        return position;
    }
    function updateStoneInfo(idx) {
        stoneInfoList[idx] = new StoneInfo(genRandomStartPoint(), genRandomEndPoint(), genRandomStartTime());
    }
    function genRandomStartPoint() {
        var x = (2 * Math.random() - 1) * 10;
        var y = (Math.random() - 1 / 2) * VISION_HEIGHT;
        var z = (Math.random() - 1 / 2) * VISION_WIDTH;
        return new BABYLON.Vector3(x, y, z);
    }
    function genRandomEndPoint() {
        var x = (2 * Math.random() - 1) * 20 + CAMERA_RADIUS;
        var y = (Math.random() - 1 / 2) * VISION_HEIGHT;
        var z = (Math.random() - 1 / 2) * VISION_WIDTH;
        return new BABYLON.Vector3(x, y, z);
    }
    function genRandomStartTime() {
        return ANIMATION_TIME * Math.random();
    }
    function createScene(engine) {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(255 / 255, 250 / 255, 250 / 255);
        var hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(100, 100, 100), scene);
        var camera = new BABYLON.TouchCamera('camera', new BABYLON.Vector3(CAMERA_RADIUS, 0, 0), scene);
        camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        var stoneMaterial = new BABYLON.StandardMaterial('stoneMaterial', scene);
        stoneMaterial.diffuseTexture = new BABYLON.Texture('./assets/stones/stone.jpg', scene);
        stoneMaterial.diffuseTexture.hasAlpha = true;
        stoneMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // color reflection
        stoneMaterial.backFaceCulling = false;
        for (var idx = 1; idx < MODEL_COUNT + 1; idx++) {
            (function (idx) {
                BABYLON.SceneLoader.ImportMesh('', './assets/stones/', 'stone' + idx + '.babylon', scene, function (meshes) {
                    var stone = meshes[0];
                    stone.isVisible = false;
                    stone.rotation = new BABYLON.Vector3(0, 0, 0);
                    stone.position = new BABYLON.Vector3(0, 0, 0);
                    stone.material = stoneMaterial;
                    stoneList.push(stone);
                    stoneList.push(stone);
                });
            })(idx);
        }
        return scene;
    }
})(FlyingStone || (FlyingStone = {}));
FlyingStone.init();
