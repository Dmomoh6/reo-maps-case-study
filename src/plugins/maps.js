import { ref, watch } from "vue";
import { notify } from "@kyvg/vue3-notification";
import { v4 as uuidv4 } from "uuid";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

export default {
  install: (app) => {
    //to ensure the map is not rendered twice
    let isLoaded = false;
    let waiting = [];
    //to store the map canvas for global distribution outside the showMap function
    let mapB = null;

    //ref for storing markers
    const marks = ref([]);
    //ref for the groups
    const groups = ref([]);
    //to store each marker
    let markers = [];
    //to store polygons
    let polygons = [];

    //the svg for the custom markers
    let coloredMarkerDef = {
      svg: [
        '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="13.1px" height="13.1px" viewBox="0 0 13.1 13.1" xml:space="preserve">',
        '<path fill="#ffffff" stroke="{strokeColor}" stroke-width="4.5" stroke-miterlimit="10" d="M10.8,6.5c0,2.4-1.9,4.3-4.3,4.3S2.2,8.9,2.2,6.5s1.9-4.3,4.3-4.3S10.8,4.2,10.8,6.5z"/>',
        "</svg>",
      ].join(""),
      anchor: { x: 6, y: 6 },
      size: { width: 13, height: 13 },
    };

    let getColoredMarkerSvg = function (color) {
      return coloredMarkerDef.svg.replace("{strokeColor}", color);
    };

    let getColoredMarkerUri = function (color) {
      return (
        "data:image/svg+xml," + encodeURIComponent(getColoredMarkerSvg(color))
      );
    };

    let getColoredMarkerIcon = function (color) {
      return {
        url: getColoredMarkerUri(color),
        anchor: coloredMarkerDef.anchor,
        size: coloredMarkerDef.size,
        scaledSize: coloredMarkerDef.size,
      };
    };

    //notification codes
    function addedNotification() {
      const text = "New point has been placed on the map.";
      notify({
        group: "notification",
        title: "Point added",
        type: "success",
        text,
      });
    }

    function renamedNotification() {
      const text = "Name has been changed successfully";
      notify({
        group: "notification",
        title: "Name changed",
        type: "success",
        text,
      });
    }

    function groupColorNotification() {
      const text = "The group color has been changed successfully";
      notify({
        group: "notification",
        title: "Group color changed",
        type: "success",
        text,
      });
    }

    function clearedNotification() {
      const text = "All points have been removed from the map.";
      notify({
        group: "notification",
        title: "Points cleared",
        type: "error",
        text,
      });
    }

    //code to generate Colors randomly
    function generateColor() {
      return (
        "#" +
        (0xffffffff - Math.random() * 0xffffffff).toString(16).substr(0, 6)
      );
    }

    //code to initiate google Maps and adding the google script
    window.initGoogleMaps = initGoogleMaps;
    addScript();

    function addScript() {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_MAPS_KEY
      }&libraries=geometry&callback=initGoogleMaps`;
      script.async = true;
      document.head.appendChild(script);
    }

    function initGoogleMaps() {
      isLoaded = true;
      waiting.forEach((item) => {
        if (typeof item.fn === "function") {
          item.fn(...item.arguments);
        }
      });
      waiting = [];
    }

    //code to render the map on the canvas
    function showMap(canvas) {
      if (!isLoaded) {
        waiting.push({ fn: showMap, arguments });
        return;
      }
      const mapOptions = {
        zoom: 13,
        center: new window.google.maps.LatLng(52.52, 13.405),
        disableDefaultUI: true,
        zoomControl: false,
        clickableIcons: false,
        styles: [
          {
            featureType: "poi",
            elementType: "all",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "all",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      };

      const map = new window.google.maps.Map(canvas, mapOptions);
      mapB = map;

      //add event listener to add new marker when map canvas is clicked on
      map.addListener("click", function (e) {
        const markerId = uuidv4();

        markers.push(
          new google.maps.Marker({
            position: e.latLng,
            map: map,
            id: markerId,
            clickable: false,
            label: {
              text: " ",
              className: "markers",
            },
            icon: getColoredMarkerIcon("#767676"),
          })
        );
        marks.value.push({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          id: markerId,
          name: uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: "-",
            length: 2,
          }),
          group: "ungrouped",
        });
        groupPoints();

        addedNotification();
      });
    }

    //function to clear the markers from the canvas and consequently, clear all polygons too
    function clearMarkers() {
      marks.value = [];

      markers.forEach((marker) => {
        marker.setMap(null);
        marker = null;
      });

      polygons.forEach((polygon) => {
        polygon.setMap(null);
        polygon = null;
      });

      markers = [];
      polygons = [];
      groups.value = [];
      clearedNotification();
    }

    //to change name of the marker if called from the Coordinates.vue section
    function changeName(id) {
      const index = marks.value.findIndex((item) => item.id === id);
      if (index === -1) return;
      marks.value[index].name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: "-",
        length: 2,
      });
      renamedNotification();
    }

    //to change groupColor
    function changeGroupColor(id) {
      const index = groups.value.findIndex((item) => item.id === id);
      if (index === -1) return;

      const newColor = generateColor();
      groups.value[index].color = newColor;

      groups.value[index].points.forEach((point) => {
        let marker = markers.find((marker) => marker.id === point);
        marker.setMap(null);
        marker.icon = getColoredMarkerIcon(newColor);
        marker.setMap(mapB);
      });

      polygons.forEach((polygon) => {
        polygon.setMap(null);
        polygon = null;
      });

      polygons = [];

      groups.value.forEach((group) => {
        let bounds = new google.maps.LatLngBounds();
        const paths = [];
        group.points.forEach((point) => {
          let pointer = marks.value.find((item) => item.id === point);
          paths.push(new google.maps.LatLng(pointer.lat, pointer.lng));
          bounds.extend(new google.maps.LatLng(pointer.lat, pointer.lng));
        });

        let centerPt = bounds.getCenter();
        paths.sort(sortFunc);

        function sortFunc(a, b) {
          let bearA = google.maps.geometry.spherical.computeHeading(
            centerPt,
            a
          );
          let bearB = google.maps.geometry.spherical.computeHeading(
            centerPt,
            b
          );
          return bearA - bearB;
        }

        polygons.push(
          new google.maps.Polygon({
            paths: paths,
            map: mapB,
            id: group.id,
            strokeColor: group.color,
            strokeOpacity: 0.9,
            strokeWeight: 1,
            fillColor: group.color,
            fillOpacity: 0.55,
          })
        );
      });

      groupColorNotification();
    }

    // to group the Points according to their positions on the map canvas
    function groupPoints() {
      if (marks.value.length < 9) return;

      marks.value.forEach((mark) => {
        mark.group = "ungrouped";
      });

      polygons.forEach((polygon) => {
        polygon.setMap(null);
        polygon = null;
      });

      polygons = [];

      groups.value = [];

      const maxDistance = getMaximumDistance();

      const allowedDistance = maxDistance * 0.25;

      for (let i = 0; i < marks.value.length; i++) {
        let groupId = uuidv4();
        let groupColor = generateColor();
        let group = [];
        let point = marks.value[i];
        if (point.group !== "ungrouped") continue;

        for (let j = 0; j < marks.value.length; j++) {
          let point2 = marks.value[j];
          if (
            point != point2 &&
            haversine_distance(point, point2) < allowedDistance &&
            point2.group == "ungrouped"
          ) {
            group.push(point.id);
            group.push(point2.id);
            marks.value[i].group = groupId;
            marks.value[j].group = groupId;
          }
        }
        group = [...new Set(group)];

        groups.value.push({
          id: groupId,
          points: group,
          color: groupColor,
        });
      }

      groups.value = groups.value.filter((group) => group.points.length > 1);
      markers.forEach((marker) => {
        marker.setMap(null);
        let groupIndex = groups.value.findIndex((group) =>
          group.points.includes(marker.id)
        );

        if (groupIndex !== -1) {
          marker.icon = getColoredMarkerIcon(groups.value[groupIndex].color);
        }

        marker.setMap(mapB);

        groups.value.forEach((group) => {
          let bounds = new google.maps.LatLngBounds();
          const paths = [];
          group.points.forEach((point) => {
            let pointer = marks.value.find((item) => item.id === point);
            paths.push(new google.maps.LatLng(pointer.lat, pointer.lng));
            bounds.extend(new google.maps.LatLng(pointer.lat, pointer.lng));
          });

          let centerPt = bounds.getCenter();
          paths.sort(sortFunc);

          //to sort points that way the grouping connects the points at the edges and not causing overlaps
          function sortFunc(a, b) {
            let bearA = google.maps.geometry.spherical.computeHeading(
              centerPt,
              a
            );
            let bearB = google.maps.geometry.spherical.computeHeading(
              centerPt,
              b
            );
            return bearA - bearB;
          }

          polygons.push(
            new google.maps.Polygon({
              paths: paths,
              map: mapB,
              id: group.id,
              strokeColor: group.color,
              strokeOpacity: 0.2,
              strokeWeight: 1,
              fillColor: group.color,
              fillOpacity: 0.06,
            })
          );
        });
      });
    }

    //to get the maximum distance between all the markers on the canvas
    function getMaximumDistance() {
      let distance = 0;
      let max = 0;
      for (let i = 0; i < marks.value.length; i++) {
        for (let j = 0; j < marks.value.length; j++) {
          distance = haversine_distance(marks.value[i], marks.value[j]);
          if (distance > max) {
            max = distance;
          }
        }
      }
      return max;
    }

    //haversine_distance() gotten from a blog on cloud.google.com to calculate distance between two markers
    function haversine_distance(mk1, mk2) {
      let R = 3958.8;
      let rlat1 = mk1.lat * (Math.PI / 180);
      let rlat2 = mk2.lat * (Math.PI / 180);
      let difflat = rlat2 - rlat1;
      let difflon = (mk2.lng - mk1.lng) * (Math.PI / 180);

      let d =
        2 *
        R *
        Math.asin(
          Math.sqrt(
            Math.sin(difflat / 2) * Math.sin(difflat / 2) +
              Math.cos(rlat1) *
                Math.cos(rlat2) *
                Math.sin(difflon / 2) *
                Math.sin(difflon / 2)
          )
        );
      return d;
    }

    app.provide("marks", marks);
    app.provide("groups", groups);
    app.provide("changeName", changeName);
    app.provide("changeGroupColor", changeGroupColor);
    app.provide("showMap", showMap);
    app.provide("clearMarkers", clearMarkers);
    app.provide("groupPoints", groupPoints);
  },
};
