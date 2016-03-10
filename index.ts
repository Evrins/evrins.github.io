namespace FlyingStone {
    var fps = document.getElementById('fps');
    var canvas = <HTMLCanvasElement>document.getElementById('stone');
    var engine = new BABYLON.Engine(canvas);
    var scene: BABYLON.Scene;
    const SCALE = canvas.clientWidth < canvas.clientHeight ? canvas.clientWidth / 100 : canvas.clientHeight / 100;
    const VISION_WIDTH = 150;
    const VISION_HEIGHT = 150;
    const MOVE_LIMIT_WIDTH = 200;
    const MOVE_LIMIT_HEIGHT = 200;
    const CAMERA_RADIUS = 2500;
    var START_TIME = 0;
    const ANIMATION_TIME = 5000;
    const STONE_COUNT = 18;
    const MODEL_COUNT = 9;
    const INTERVAL = 1000 / 60;
    var isRunning = false;
    var touchStartPoint: BABYLON.Vector2 = new BABYLON.Vector2(0, 0);

    var stoneList: BABYLON.AbstractMesh[] = [];
    var stoneInfoList: StoneInfo[] = [];

    function showAxis(size: number, scene: BABYLON.Scene) {
        function makeTextPlane(text: string, color: string, size: number) {
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
            let delta = Date.now() - START_TIME;
            stoneList.forEach((stone, idx) => {
                stone.position = getPosition(idx, delta);
                stone.rotation.x += Math.PI / 100 * Math.random();
                stone.rotation.y += Math.PI / 100 * Math.random();
                stone.rotation.z += Math.PI / 100 * Math.random();
            });
        }
    }

    export function init() {
        scene = createScene(engine);
        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
            fps.innerHTML = engine.getFps().toFixed() + " fps";
        });
        for (let i = 0; i < STONE_COUNT; i++) {
            let info = new StoneInfo(genRandomStartPoint(), genRandomEndPoint(), genRandomStartTime());
            stoneInfoList.push(info);
        }
        window.addEventListener('resize', function(evt) {
            engine.resize();
        });

        canvas.addEventListener('pointerdown', function(evt) {
            evt.preventDefault();
            touchStartPoint = new BABYLON.Vector2(evt.x, evt.y);
        });

        canvas.addEventListener('pointermove', function(evt) {
            evt.preventDefault();
            let camera = scene.getCameraByName('camera');
            let cameraPosition = camera.position;
            let cameraY = camera.position.y + evt.y - touchStartPoint.y;
            let cameraZ = camera.position.z + touchStartPoint.x - evt.x;
            touchStartPoint = new BABYLON.Vector2(evt.x, evt.y);
            if (cameraY >= - 1 / 2 * MOVE_LIMIT_HEIGHT && cameraY <= 1 / 2 * MOVE_LIMIT_HEIGHT &&
                cameraZ >= -1 / 2 * MOVE_LIMIT_WIDTH && cameraZ <= 1 / 2 * MOVE_LIMIT_WIDTH) {
                camera.position = new BABYLON.Vector3(camera.position.x, cameraY, cameraZ);
                camera.setTarget(new BABYLON.Vector3(0, cameraY, cameraZ));
            }
        });
    }

    export function start() {
        if (scene && !isRunning) {
            START_TIME = Date.now();
            scene.registerBeforeRender(moveAndRotate);
            isRunning = true;
        }
    }

    export function end() {
        scene.unregisterBeforeRender(moveAndRotate);
        reset();
        isRunning = false;
    }

    function reset() {
        if (!isRunning) {
            return;
        }
        stoneList.forEach((value, idx) => {
            value.position = new BABYLON.Vector3(0, 0, 0);
        });
    }

    class StoneInfo {
        startPosition: BABYLON.Vector3;
        endPosition: BABYLON.Vector3;
        startTimeOffset: number;
        constructor(start, end, offset) {
            this.startPosition = start;
            this.endPosition = end;
            this.startTimeOffset = offset;
        }
    }

    function getPosition(idx: number, delta: number): BABYLON.Vector3 {
        let position = new BABYLON.Vector3(0, 0, 0);
        let stoneInfo = stoneInfoList[idx];
        let stone = stoneList[idx];
        let a = delta - stoneInfo.startTimeOffset;
        let b = a % ANIMATION_TIME;
        if (a > 0) {
            if (!stone.isVisible) {
                stone.isVisible = true;
            }
            let p = b / ANIMATION_TIME;
            let q = 1 - p;
            let x = stoneInfo.startPosition.x * q + stoneInfo.endPosition.x * p;
            let y = stoneInfo.startPosition.y * q + stoneInfo.endPosition.y * p;
            let z = stoneInfo.startPosition.z * q + stoneInfo.endPosition.z * p;
            position = new BABYLON.Vector3(x, y, z);
        } else {
            if (stone.isVisible) {
                stone.isVisible = false;
            }
        }

        if (b + INTERVAL + 10 > ANIMATION_TIME) {
            updateStoneInfo(idx);
        }
        return position;
    }

    function updateStoneInfo(idx: number) {
        stoneInfoList[idx] = new StoneInfo(genRandomStartPoint(), genRandomEndPoint(), genRandomStartTime());
    }

    function genRandomStartPoint(): BABYLON.Vector3 {
        let x = (2 * Math.random() - 1) * 10;
        let y = (Math.random() - 1 / 2) * VISION_HEIGHT;
        let z = (Math.random() - 1 / 2) * VISION_WIDTH;
        return new BABYLON.Vector3(x, y, z);
    }

    function genRandomEndPoint(): BABYLON.Vector3 {
        let x = (2 * Math.random() - 1) * 20 + CAMERA_RADIUS;
        let y = (Math.random() - 1 / 2) * VISION_HEIGHT;
        let z = (Math.random() - 1 / 2) * VISION_WIDTH;
        return new BABYLON.Vector3(x, y, z);
    }

    function genRandomStartTime(): number {
        return ANIMATION_TIME * Math.random();
    }

    function createScene(engine: BABYLON.Engine) {
        let scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(255 / 255, 250 / 255, 250 / 255);
        let hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(100, 100, 100), scene);
        let camera = new BABYLON.TouchCamera('camera', new BABYLON.Vector3(CAMERA_RADIUS, 0, 0), scene);
        camera.setTarget(new BABYLON.Vector3(0, 0, 0));

        let stoneMaterial = new BABYLON.StandardMaterial('stoneMaterial', scene);
        stoneMaterial.diffuseTexture = new BABYLON.Texture('./assets/stones/stone.jpg', scene);
        stoneMaterial.diffuseTexture.hasAlpha = true;
        stoneMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // color reflection
        stoneMaterial.backFaceCulling = false;
        for (let idx = 1; idx < MODEL_COUNT + 1; idx++) {
            ((idx) => {
                BABYLON.SceneLoader.ImportMesh('', './assets/stones/', 'stone' + idx + '.babylon', scene, (meshes) => {
                    let stone = meshes[0];
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
}
FlyingStone.init();
