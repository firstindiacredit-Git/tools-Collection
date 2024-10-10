"use strict";
const recordbtn = document.getElementById("recordbtn"),
  videoElem = document.getElementById("video"),
  canvasElem = document.getElementById("canvas"),
  viewElem = document.getElementById("viewdiv"),
  imgElem = document.getElementById("img"),
  startElem = document.getElementById("recordbtn"),
  saveElem = document.getElementById("savebtn"),
  shareElem = document.getElementById("sharebtn"),
  opSel = document.getElementsByName("opsel"),
  fmt = document.getElementsByName("fmt"),
  cropbtn = document.getElementById("cropbtn"),
  clearbtn = document.getElementById("clearbtn"),
  penColor = document.getElementById("pencolor"),
  penWidth = document.getElementById("penwidth"),
  fontColor = document.getElementById("fontcolor"),
  fontSize = document.getElementById("fontsize"),
  fontFamilySel = document.getElementById("fontfamily"),
  browserWarnDiv = document.getElementById("browserwarndiv"),
  selectDiv = document.getElementById("selectdiv"),
  drawDiv = document.getElementById("drawdiv"),
  textDiv = document.getElementById("textdiv");
var rectleft,
  recttop,
  mediaRecorder,
  cropwidth,
  cropheight,
  fText,
  fImg,
  recordedChunks = [],
  dataAvailableCount = 0,
  cropper = null,
  isCaptured = !1,
  fCanvas = null,
  dpr = window.devicePixelRatio || 1,
  previ = null,
  rect = null,
  crect = null,
  mouseDown = null,
  disabled = !1,
  frect = {},
  ftype = 0;
function checkBrowser() {
  var e = GetOS();
  ("iOS" == e || "Android" == e) && (browserWarnDiv.style.display = "block"),
    ("object" != typeof navigator.mediaDevices ||
      "function" != typeof navigator.mediaDevices.getDisplayMedia) &&
      (browserWarnDiv.style.display = "block");
}
function setFontStyle() {
  for (var e = 0; e < fontFamilySel.length; e++)
    fontFamilySel.options[e].style.fontFamily = fontFamilySel.options[e].text;
}
async function startCapture() {
  0 == previ && closeCrop(),
    (recordbtn.disabled = !0),
    (videoElem.style.cursor = "progress"),
    (videoElem.style.display = "block"),
    (canvasElem.style.display = "none"),
    (isCaptured = !1),
    null != fCanvas && (fCanvas.clear(), fCanvas.dispose()); //!!!???!!!???
  var e = window.screen.availWidth * dpr,
    t = window.screen.availHeight * dpr;
  let n = null;
  try {
    ((n = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { minWidth: e, ideal: e },
        height: { minHeight: t, ideal: t },
      },
      audio: !1,
    })).getVideoTracks()[0].onended = function () {
      stopCapture();
    }),
      (videoElem.srcObject = n),
      (videoElem.autoplay = !0),
      (videoElem.muted = !0),
      (recordedChunks = []),
      (dataAvailableCount = 0),
      ((mediaRecorder = new MediaRecorder(n, {
        mimeType: "video/webm; codecs=vp8",
      })).ondataavailable = handleDataAvailable),
      mediaRecorder.start(100);
  } catch (a) {
    console.log("Error: " + a), (recordbtn.disabled = !1);
  }
}
function onClearBtn() {
  var e = fCanvas.getActiveObjects();
  fCanvas.discardActiveObject(), fCanvas.remove(...e);
}
function handleDataAvailable(e) {
  if (e.data.size > 0) {
    if (
      (recordedChunks.push(e.data),
      1 == ++dataAvailableCount && stopCapture(),
      2 == dataAvailableCount)
    ) {
      var t = new Blob(recordedChunks, { type: "video/webm" });
      videoElem.addEventListener("canplaythrough", onCanPlay, { once: !0 }),
        (videoElem.src = URL.createObjectURL(t)),
        (videoElem.autoplay = !1),
        (videoElem.muted = !0);
    }
  } else console.log(e.data);
}
function stopCapture() {
  if (null != videoElem.srcObject)
    videoElem.srcObject.getTracks().forEach((e) => e.stop()),
      (videoElem.srcObject = null);
}
function onCanPlay() {
  document.hidden
    ? document.addEventListener(
        "visibilitychange",
        function () {
          document.hidden ||
            setTimeout(function () {
              setCanvas();
            }, 500);
        },
        { once: !0 }
      )
    : setTimeout(function () {
        setCanvas();
      }, 500),
    saveElem.classList.remove("disabled"),
    shareElem.classList.remove("disabled");
}
function setCanvas() {
  (canvasElem.width = videoElem.videoWidth),
    (canvasElem.height = videoElem.videoHeight),
    canvasElem.getContext("2d").drawImage(videoElem, 0, 0),
    (isCaptured = !0),
    (videoElem.style.display = "none"),
    (canvasElem.style.display = "block"),
    initFabric(),
    (recordbtn.disabled = !1);
  for (
    var e = document.querySelectorAll("#opsel>label"), t = 0;
    t < e.length;
    t++
  )
    e[t].classList.remove("disabled");
  (videoElem.style.cursor = "pointer"), onOpSel();
}
function initFabric() {
  null == crect && (crect = canvasElem.getBoundingClientRect());
  var e = canvasElem.toDataURL("image/png");
  (fCanvas = new fabric.Canvas("canvas")).setBackgroundImage(
    e,
    fCanvas.renderAll.bind(fCanvas)
  );
  var t = fCanvas.width / dpr,
    n = fCanvas.height / dpr;
  t > crect.width &&
    ((n = Math.round((n * crect.width) / t)), (t = Math.round(crect.width))),
    fCanvas.setWidth(t + "px", { cssOnly: !0 }),
    fCanvas.setHeight(n + "px", { cssOnly: !0 });
}
function onOpSel(e) {
  (selectDiv.style.display = "none"),
    (drawDiv.style.display = "none"),
    (textDiv.style.display = "none"),
    0 == e && (selectDiv.style.display = "block"),
    1 == e && (drawDiv.style.display = "block"),
    2 == e && (textDiv.style.display = "block"),
    3 == e && FullscreenReq(),
    !1 == isCaptured
      ? (videoElem.style.display = "block")
      : (videoElem.style.display = "none"),
    null != fCanvas && (2 == e || 3 == e ? selectable() : unselectable()),
    0 == e ? initCrop() : 0 != e && 0 == previ && closeCrop(),
    1 == e ? onDraw() : 1 != e && 1 == previ && (fCanvas.isDrawingMode = !1),
    2 == e
      ? fCanvas.on("mouse:up", onAddText)
      : 2 == previ && fCanvas.off("mouse:up", onAddText),
    (previ = e);
}
function selectable() {
  fCanvas.forEachObject(function (e) {
    e.selectable = !0;
  });
}
function unselectable() {
  fCanvas.forEachObject(function (e) {
    e.selectable = !1;
  });
}
function FullscreenReq() {
  let e = canvasElem;
  e.requestFullscreen
    ? e.requestFullscreen()
    : e.mozRequestFullScreen
    ? e.mozRequestFullScreen()
    : e.webkitRequestFullscreen
    ? e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    : e.msRequestFullscreen && e.msRequestFullscreen();
}
function OnFullscreen() {
  document.fullscreenElement
    ? ((fullscreen = !0),
      chartdiv.style.setProperty("width", window.innerWidth + "px"),
      chartdiv.style.setProperty("height", window.innerHeight + "px"),
      (xsize = x),
      (ysize = y),
      setGraphSize())
    : ((fullscreen = !1),
      chartdiv.style.setProperty("width", "100%"),
      chartdiv.style.setProperty("height", "100%"),
      (x = xsize),
      (y = ysize)),
    drawChart();
}
function initCrop() {
  (rect = new fabric.Rect({
    fill: "transparent",
    originX: "left",
    originY: "top",
    stroke: "#444",
    strokeDashArray: [4, 2],
    strokeWidth: 2,
    opacity: 1,
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    visible: !1,
  })),
    fCanvas.add(rect),
    fCanvas.on("mouse:down", cropMouseDown),
    fCanvas.on("mouse:move", cropMouseMove),
    fCanvas.on("mouse:up", cropMouseUp);
}
function closeCrop() {
  fCanvas.remove(rect),
    fCanvas.off("mouse:down", cropMouseDown),
    fCanvas.off("mouse:move", cropMouseMove),
    fCanvas.off("mouse:up", cropMouseUp);
}
function cropMouseDown(e) {
  if (!disabled) {
    var t = fCanvas.getPointer(e.e);
    (frect.left = t.x),
      (frect.top = t.y),
      (rect.left = t.x),
      (rect.top = t.y),
      (rect.visible = !0),
      (mouseDown = e.e),
      fCanvas.bringToFront(rect);
  }
}
function cropMouseMove(e) {
  if (mouseDown && !disabled) {
    var t = fCanvas.getPointer(e.e),
      n = t.x - frect.left,
      a = t.y - frect.top;
    n < 0 ? ((n = -n), (rect.left = t.x)) : (rect.left = frect.left),
      a < 0 ? ((a = -a), (rect.top = t.y)) : (rect.top = frect.top),
      (frect.width = n),
      (frect.height = a),
      (rect.width = n),
      (rect.height = a),
      fCanvas.renderAll();
  }
}
function cropMouseUp() {
  (mouseDown = null), (cropbtn.disabled = !1);
}
function onCrop() {
  var e = new Image();
  (e.onload = function () {
    fCanvas.clear();
    var t = new fabric.Image(e);
    (t.left = 0),
      (t.top = 0),
      t.setCoords(),
      fCanvas.setBackgroundImage(t, fCanvas.renderAll.bind(fCanvas));
  }),
    (e.src = fCanvas.toDataURL({
      left: frect.left,
      top: frect.top,
      width: frect.width,
      height: frect.height,
    }));
}
function onDraw() {
  (fCanvas.isDrawingMode = !0),
    (fCanvas.freeDrawingBrush.color = penColor.value),
    (fCanvas.freeDrawingBrush.width = penWidth.value);
}
function onAddText(e) {
  if (!e.target) {
    var t = fCanvas.getPointer(event.e),
      n = document.getElementById("underlinebtn").classList.contains("active"),
      a = document.getElementById("italicbtn").classList.contains("active")
        ? "italic"
        : "normal",
      l = document.getElementById("boldbtn").classList.contains("active")
        ? "bold"
        : "normal",
      o = new fabric.IText("xxxxxx", {
        left: t.x,
        top: t.y,
        strokeWidth: 2,
        fill: fontColor.value,
        stroke: fontColor.value,
        fontSize: fontSize.value,
        fontFamily: fontFamilySel.options[fontFamilySel.selectedIndex].value,
        underline: n,
        fontStyle: a,
        fontWeight: l,
      });
    fCanvas.add(o);
  }
}
function OnFileType(e) {
  ftype = e;
}
function save() {
  let e = ["image/webp", "image/png"][ftype],
    t = [".webp", ".png"][ftype];
  var n = document.getElementById("filename").value;
  "" == n && (n = "screenshot");
  var a = canvas.toDataURL(e, 0.92),
    l = document.createElement("a");
  document.body.appendChild(l),
    (l.style = "display: none"),
    (l.href = a),
    (l.download = n + t),
    l.click(),
    window.URL.revokeObjectURL(a);
}
function share() {
  let e = ["image/webp", "image/png"][ftype],
    t = [".webp", ".png"][ftype];
  canvas.toBlob((n) => {
    let a = "" == filename.value ? "screenshot" : filename.value,
      l = a + t;
    var o = [new File([n], l, { type: e })];
    navigator.canShare && navigator.canShare({ files: o })
      ? navigator
          .share({ files: o, title: a, text: l })
          .then(() => console.log("Share was successful."))
          .catch((e) => console.log("Sharing failed", e))
      : console.log("Your system doesn't support sharing files.");
  });
}
window.onload = function () {
  (canvasElem.style.display = "none"),
    (cropbtn.disabled = !0),
    (selectDiv.style.display = "none"),
    (drawDiv.style.display = "none"),
    (textDiv.style.display = "none"),
    startElem.addEventListener("click", startCapture, !1),
    clearbtn.addEventListener("click", onClearBtn, !1),
    cropbtn.addEventListener("click", onCrop, !1),
    penColor.addEventListener("change", onDraw, !1),
    penWidth.addEventListener("change", onDraw, !1),
    saveElem.addEventListener("click", save, !1),
    shareElem.addEventListener("click", share, !1),
    checkBrowser(),
    setFontStyle();
};
