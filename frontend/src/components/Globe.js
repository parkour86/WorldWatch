import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { fetchEarthquakes } from "../utils/fetchEarthquakes";
import { fetchTornadoes } from "../utils/fetchTornadoes";
import { fetchWildfires } from "../utils/fetchWildfires";
import { fetchHurricanes } from "../utils/fetchHurricanes";
import { fetchPlanes } from "../utils/fetchPlanes";

function Globe() {
  const mountRef = useRef(null);
  const [earthquakes, setEarthquakes] = useState([]);
  const [tornadoes, setTornadoes] = useState([]);
  const [wildfires, setWildfires] = useState([]);
  const [hurricanes, setHurricanes] = useState([]);
  const [planes, setPlanes] = useState([]);

  const [showEarthquakes, setShowEarthquakes] = useState(true);
  const [showTornadoes, setShowTornadoes] = useState(true);
  const [showWildfires, setShowWildfires] = useState(true);
  const [showHurricanes, setShowHurricanes] = useState(true);
  const [showPlanes, setShowPlanes] = useState(true);

  const [selectedInfo, setSelectedInfo] = useState(null);

  function latLonToVec3(lat, lon, radius = 5) {
    let phi = (90 - lat) * (Math.PI / 180);
    let theta = (lon + 180) * (Math.PI / 180);
    let x = -radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.cos(phi);
    let z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.innerHTML = ""; 
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const earthTex = new THREE.TextureLoader().load("/earth_texture.jpg");
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(5, 64, 64),
      new THREE.MeshPhongMaterial({ map: earthTex })
    );
    scene.add(globe);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;

    const eqGroup = new THREE.Group();
    const tGroup = new THREE.Group();
    const wGroup = new THREE.Group();
    const hGroup = new THREE.Group();
    const pGroup = new THREE.Group();
    globe.add(eqGroup, tGroup, wGroup, hGroup, pGroup);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onClick(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects([
        ...eqGroup.children,
        ...tGroup.children,
        ...wGroup.children,
        ...hGroup.children,
        ...pGroup.children,
      ]);
      if (hits.length) setSelectedInfo(hits[0].object.userData);
      else setSelectedInfo(null);
    }
    renderer.domElement.addEventListener("click", onClick);

    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    async function updateData() {
      const eq = await fetchEarthquakes();
      setEarthquakes(eq);
      eqGroup.clear();
      if (showEarthquakes) {
        eq.forEach((e) => {
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
          );
          m.position.copy(latLonToVec3(e.lat, e.lon, 5.1));
          m.userData = { type: "Earthquake", magnitude: e.mag, lat: e.lat, lon: e.lon };
          eqGroup.add(m);
        });
      }

      const torns = await fetchTornadoes();
      setTornadoes(torns);
      tGroup.clear();
      if (showTornadoes) {
        torns.forEach((t) => {
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
          );
          m.position.copy(latLonToVec3(t.lat, t.lon, 5.15));
          m.userData = { type: "Tornado", lat: t.lat, lon: t.lon };
          tGroup.add(m);
        });
      }

      const hurs = await fetchHurricanes();
      setHurricanes(hurs);
      hGroup.clear();
      if (showHurricanes) {
        hurs.forEach((h) => {
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
          );
          m.position.copy(latLonToVec3(h.lat, h.lon, 5.25));
          m.userData = { type: "Hurricane", title: h.title, lat: h.lat, lon: h.lon };
          hGroup.add(m);
        });
      }

      const pls = await fetchPlanes();
      setPlanes(pls);
      pGroup.clear();
      if (showPlanes) {
        pls.forEach((p) => {
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffff80 })
          );
          m.position.copy(latLonToVec3(p.lat, p.lon, 5.3));
          m.userData = { type: "Plane", callsign: p.callsign, altitude: p.altitude };
          pGroup.add(m);
        });
      }

      const fires = await fetchWildfires();
      const trimmed = fires.slice(100, 175);
      setWildfires(trimmed);
      wGroup.clear();
      if (showWildfires) {
        trimmed.forEach((f) => {
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffa500 })
          );
          m.position.copy(latLonToVec3(f.lat, f.lon, 5.2));
          m.userData = { type: "Wildfire", title: f.title || "Unknown", lat: f.lat, lon: f.lon };
          wGroup.add(m);
        });
      }
    }

    updateData();
    const timer = setInterval(updateData, 1800000);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener("click", onClick);

      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [showEarthquakes, showTornadoes, showWildfires, showHurricanes, showPlanes]);

  const strongestEQ = earthquakes.length
    ? Math.max(...earthquakes.map((e) => e.mag))
    : 0;

  return <>
    <div style={{width:'100%',height:'100vh',position:'relative'}}>
      <div ref={mountRef} style={{width:'100%',height:'100%'}}/>
      <div style={{position:'absolute',top:20,left:20,fontSize:36,fontWeight:'bold',color:'white'}}>WorldWatch+</div>
      <div style={{position:'absolute',top:80,right:20,background:'rgba(220,220,220,0.85)',padding:10,borderRadius:8,fontSize:20}}>
        <strong>Filters</strong>
        <div><label><input type='checkbox' checked={showEarthquakes} onChange={function(){setShowEarthquakes(!showEarthquakes)}}/> Earthquakes</label></div>
        <div><label><input type='checkbox' checked={showTornadoes} onChange={function(){setShowTornadoes(!showTornadoes)}}/> Tornadoes</label></div>
        <div><label><input type='checkbox' checked={showHurricanes} onChange={function(){setShowHurricanes(!showHurricanes)}}/> Hurricanes</label></div>
        <div><label><input type='checkbox' checked={showWildfires} onChange={function(){setShowWildfires(!showWildfires)}}/> Wildfires</label></div>
        <div><label><input type='checkbox' checked={showPlanes} onChange={function(){setShowPlanes(!showPlanes)}}/> Planes</label></div>

        <div style={{marginTop:10}}><strong>Legend</strong></div>
        <div><span style={{color:'#ff0000'}}>●</span> Earthquakes</div>
        <div><span style={{color:'#0000ff'}}>●</span> Tornado</div>
        <div><span style={{color:'#00ff00'}}>●</span> Hurricane</div>
        <div><span style={{color:'#ffa500'}}>●</span> Wildfire</div>
        <div><span style={{color:'#ffff80'}}>●</span> Plane</div>

        <div style={{marginTop:10}}><strong>Data Summary</strong>
          <div>Earthquakes: {earthquakes.length}</div>
          <div>Strongest EQ: {strongestEQ}</div>
          <div>Tornadoes: {tornadoes.length}</div>
          <div>Wildfires: {wildfires.length}</div>
          <div>Planes: {planes.length}</div>
        </div>
      </div>

      {selectedInfo && <div style={{position:'absolute',fontSize:22,bottom:60,left:20,background:'rgba(0,0,0,0.6)',padding:8,borderRadius:6,color:'white'}}>
        <strong>{selectedInfo.type}</strong>
        {selectedInfo.lat && <div>Lat: {selectedInfo.lat}</div>}
        {selectedInfo.lon && <div>Lon: {selectedInfo.lon}</div>}
        {selectedInfo.magnitude && <div>Magnitude: {selectedInfo.magnitude}</div>}
        {selectedInfo.title && <div>{selectedInfo.title}</div>}
        {selectedInfo.callsign && <div>Call Sign: {selectedInfo.callsign}</div>}
        {selectedInfo.altitude && <div>Altitude: {selectedInfo.altitude}</div>}
      </div>}
    </div>

      <div style={{position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: 18, textAlign: 'center'}}>
        Made by Sebastian Booth | <a href="https://github.com/bidahs" target="_blank" rel="noopener noreferrer" style={{color:'white', textDecoration:'underline'}}>GitHub</a>
      </div>
  </>
}

export default Globe;
