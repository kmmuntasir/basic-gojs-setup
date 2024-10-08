const diagramDivId = 'myDiagramDiv';
const paletteDivId = 'myPaletteDiv';

function init() {
    myDiagram = new go.Diagram(diagramDivId, {
        grid: new go.Panel('Grid')
            .add(
                new go.Shape('LineH', {
                    stroke: 'lightgray',
                    strokeWidth: 0.5
                }),
                new go.Shape('LineH', {
                    stroke: 'gray',
                    strokeWidth: 0.5,
                    interval: 10
                }),
                new go.Shape('LineV', {
                    stroke: 'lightgray',
                    strokeWidth: 0.5
                }),
                new go.Shape('LineV', {
                    stroke: 'gray',
                    strokeWidth: 0.5,
                    interval: 10
                })
            ),
        'draggingTool.dragsLink': true,
        'draggingTool.isGridSnapEnabled': true,
        'linkingTool.isUnconnectedLinkValid': true,
        'linkingTool.portGravity': 20,
        'relinkingTool.isUnconnectedLinkValid': true,
        'relinkingTool.portGravity': 20,
        'relinkingTool.fromHandleArchetype': new go.Shape('Diamond', {
            segmentIndex: 0,
            cursor: 'pointer',
            desiredSize: new go.Size(8, 8),
            fill: 'tomato',
            stroke: 'darkred'
        }),
        'relinkingTool.toHandleArchetype': new go.Shape('Diamond', {
            segmentIndex: -1,
            cursor: 'pointer',
            desiredSize: new go.Size(8, 8),
            fill: 'darkred',
            stroke: 'tomato'
        }),
        'linkReshapingTool.handleArchetype': new go.Shape('Diamond', {
            desiredSize: new go.Size(7, 7),
            fill: 'lightblue',
            stroke: 'deepskyblue'
        }),
        'rotatingTool.handleAngle': 270,
        'rotatingTool.handleDistance': 30,
        'rotatingTool.snapAngleMultiple': 15,
        'rotatingTool.snapAngleEpsilon': 15,
        'undoManager.isEnabled': true
    });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener('Modified', (e) => {
        var button = document.getElementById('SaveButton');
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf('*');
        if (myDiagram.isModified) {
            if (idx < 0) document.title += '*';
        } else {
            if (idx >= 0) document.title = document.title.slice(0, idx);
        }
    });

    // Define a function for creating a "port" that is normally transparent.
    // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
    // and where the port is positioned on the node, and the boolean "output" and "input" arguments
    // control whether the user can draw links from or to the port.
    function makePort(name, spot, output, input) {
        // the port is basically just a small transparent circle
        return new go.Shape('Circle', {
            fill: null, // not seen, by default; set to a translucent gray by showSmallPorts, defined below
            stroke: null,
            desiredSize: new go.Size(7, 7),
            alignment: spot, // align the port on the main Shape
            alignmentFocus: spot, // just inside the Shape
            portId: name, // declare this object to be a "port"
            fromSpot: spot,
            toSpot: spot, // declare where links may connect at this port
            fromLinkable: output,
            toLinkable: input, // declare whether the user may draw links to/from here
            cursor: 'pointer' // show a different cursor to indicate potential link point
        });
    }

    var nodeSelectionAdornmentTemplate = new go.Adornment('Auto')
        .add(
            new go.Shape({
                fill: null,
                stroke: 'deepskyblue',
                strokeWidth: 1.5,
                strokeDashArray: [4, 2]
            }),
            new go.Placeholder()
        );

    var nodeResizeAdornmentTemplate = new go.Adornment('Spot', {
        locationSpot: go.Spot.Right
    })
        .add(
            new go.Placeholder(),
            new go.Shape({
                alignment: go.Spot.TopLeft,
                cursor: 'nw-resize',
                desiredSize: new go.Size(6, 6),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            }),
            new go.Shape({
                alignment: go.Spot.Top,
                cursor: 'n-resize',
                desiredSize: new go.Size(6, 6),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            }),
            new go.Shape({
                alignment: go.Spot.TopRight,
                cursor: 'ne-resize',
                desiredSize: new go.Size(6, 6),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            }),
            new go.Shape({
                alignment: go.Spot.Left,
                cursor: 'w-resize',
                desiredSize: new go.Size(6, 6),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            }),
            new go.Shape({
                alignment: go.Spot.Right,
                cursor: 'e-resize',
                desiredSize: new go.Size(6, 6),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            }),
            new go.Shape({
                alignment: go.Spot.BottomLeft,
                cursor: 'se-resize',
                desiredSize: new go.Size(6, 6),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            }),
            new go.Shape({
                alignment: go.Spot.Bottom,
                cursor: 's-resize',
                desiredSize: new go.Size(6, 6),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            }),
            new go.Shape({
                alignment: go.Spot.BottomRight,
                cursor: 'sw-resize',
                desiredSize: new go.Size(6, 6),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            })
        );

    var nodeRotateAdornmentTemplate = new go.Adornment({
        locationSpot: go.Spot.Center,
        locationObjectName: 'ELLIPSE'
    })
        .add(
            new go.Shape('Ellipse', {
                name: 'ELLIPSE',
                cursor: 'pointer',
                desiredSize: new go.Size(7, 7),
                fill: 'lightblue',
                stroke: 'deepskyblue'
            }),
            new go.Shape({
                geometryString: 'M3.5 7 L3.5 30',
                isGeometryPositioned: true,
                stroke: 'deepskyblue',
                strokeWidth: 1.5,
                strokeDashArray: [4, 2]
            })
        );

    myDiagram.nodeTemplate = new go.Node('Spot', {
        locationSpot: go.Spot.Center,
        selectable: true,
        selectionAdornmentTemplate: nodeSelectionAdornmentTemplate,
        resizable: true,
        resizeObjectName: 'PANEL',
        resizeAdornmentTemplate: nodeResizeAdornmentTemplate,
        rotatable: true,
        rotateAdornmentTemplate: nodeRotateAdornmentTemplate,
        // handle mouse enter/leave events to show/hide the ports
        mouseEnter: (e, node) => showSmallPorts(node, true),
        mouseLeave: (e, node) => showSmallPorts(node, false)
    })
        .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
        .bindTwoWay('angle')
        .add(
            // the main object is a Panel that surrounds a TextBlock with a Shape
            new go.Panel('Auto', {
                name: 'PANEL'
            })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
                .add(
                    new go.Shape('Rectangle', { // default figure
                        portId: '', // the default port: if no spot on link data, use closest side
                        fromLinkable: false,
                        toLinkable: false,
                        cursor: 'pointer',
                        fill: 'white', // default color
                        strokeWidth: 1
                    })
                        .bind('figure')
                        .bind('fill'),
                    new go.TextBlock({
                        font: 'bold 10pt Helvetica, Arial, sans-serif',
                        margin: 8,
                        maxSize: new go.Size(160, NaN),
                        wrap: go.Wrap.Fit,
                        editable: false,
                        cursor: 'pointer',
                    }).bindTwoWay('text')
                ),
            // four small named ports, one on each side:
            makePort('T', go.Spot.Top, false, true),
            makePort('L', go.Spot.Left, true, true),
            makePort('R', go.Spot.Right, true, true),
            makePort('B', go.Spot.Bottom, true, false)
        );

    function showSmallPorts(node, show) {
        node.ports.each((port) => {
            if (port.portId !== '') {
                // don't change the default port, which is the big shape
                port.fill = show ? 'rgba(0,0,0,.3)' : null;
            }
        });
    }

    var linkSelectionAdornmentTemplate = new go.Adornment('Link')
        .add(
            new go.Shape({
                isPanelMain: true, // isPanelMain declares that this Shape shares the Link.geometry
                fill: null,
                stroke: 'deepskyblue',
                strokeWidth: 0 // use selection object's strokeWidth
            })
        );

    myDiagram.linkTemplate = new go.Link({ // the whole link panel
        selectable: true,
        selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: true,
        routing: go.Routing.AvoidsNodes,
        curve: go.Curve.JumpOver,
        corner: 5,
        toShortLength: 4
    })
        .bindTwoWay('points')
        .add(
            new go.Shape({ // the link path shape
                isPanelMain: true,
                strokeWidth: 2
            }),
            new go.Shape({ // the arrowhead
                toArrow: 'Standard',
                stroke: null
            }),
            new go.Panel('Auto')
                .bindObject('visible', 'isSelected')
                .add(
                    new go.Shape('RoundedRectangle', { // the link shape
                        fill: '#F8F8F8',
                        stroke: null
                    }),
                    new go.TextBlock({
                        textAlign: 'center',
                        font: '10pt helvetica, arial, sans-serif',
                        stroke: '#919191',
                        margin: 2,
                        minSize: new go.Size(10, NaN),
                        editable: true
                    }).bindTwoWay('text')
                )
        );

    // Add a selection changed listener
    myDiagram.addDiagramListener("ChangedSelection", function(e) {
        var selectedNode = myDiagram.selection.first();
        if (selectedNode instanceof go.Node) {
            // Pass the key of the selected node to your function
            nodeSelected(selectedNode.data.key);
        }
    });

    // Function to handle node selection
    function nodeSelected(nodeKey) {
        console.log("Selected Node Key: " + nodeKey);
        // Add your logic here to process the node key
    }

    load(); // load an initial diagram from some JSON text

    // initialize the Palette that is on the left side of the page
    myPalette = new go.Palette(paletteDivId, {
        maxSelectionCount: 1,
        nodeTemplateMap: myDiagram.nodeTemplateMap, // share the templates used by myDiagram
        // simplify the link template, just in this Palette
        linkTemplate: new go.Link({
            // because the GridLayout.alignment is Location and the nodes have locationSpot == Spot.Center,
            // to line up the Link in the same manner we have to pretend the Link has the same location spot
            locationSpot: go.Spot.Center,
            selectionAdornmentTemplate: new go.Adornment('Link', {
                locationSpot: go.Spot.Center
            })
                .add(
                    new go.Shape({
                        isPanelMain: true,
                        fill: null,
                        stroke: 'deepskyblue',
                        strokeWidth: 0
                    }),
                    new go.Shape({ // the arrowhead
                        toArrow: 'Standard',
                        stroke: null
                    })
                ),
            routing: go.Routing.AvoidsNodes,
            curve: go.Curve.JumpOver,
            corner: 5,
            toShortLength: 4
        })
            .bind('points')
            .add(
                new go.Shape({ // the link path shape
                    isPanelMain: true,
                    strokeWidth: 2
                }),
                new go.Shape({ // the arrowhead
                    toArrow: 'Standard',
                    stroke: null
                })
            ),
        model: new go.GraphLinksModel(
            [
                // specify the contents of the Palette
                {
                    text: 'Start',
                    figure: 'Ellipse',
                    size: '75 75',
                    fill: '#00AD5F',
                    strokeWidth: 10
                },
                {
                    text: 'Step'
                },
                {
                    text: 'Input/Output',
                    figure: 'Parallelogram1',
                    fill: 'lightgray'
                },
                {
                    text: '???',
                    figure: 'Diamond',
                    fill: 'lightskyblue'
                },
                {
                    text: 'End',
                    figure: 'Ellipse',
                    size: '75 75',
                    fill: '#CE0620'
                },
                {
                    text: 'Comment',
                    figure: 'RoundedRectangle',
                    fill: 'lightyellow'
                }
            ],
            [
                // the Palette also has a disconnected Link, which the user can drag-and-drop
                {
                    points: new go.List( /*go.Point*/ ).addAll([new go.Point(0, 0), new go.Point(30, 0), new go.Point(30, 40), new go.Point(60, 40)])
                }
            ]
        )
    });
}

// Show the diagram's model in JSON format that the user may edit
function save() {
    saveDiagramProperties(); // do this first, before writing to JSON
    document.getElementById('mySavedModel').value = myDiagram.model.toJson();
    myDiagram.isModified = false;
}

function load() {
    myDiagram.model = go.Model.fromJson(document.getElementById('mySavedModel').value);
    loadDiagramProperties(); // do this after the Model.modelData has been brought into memory
}

function saveDiagramProperties() {
    myDiagram.model.modelData.position = go.Point.stringify(myDiagram.position);
}

function loadDiagramProperties(e) {
    // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
    var pos = myDiagram.model.modelData.position;
    if (pos) myDiagram.initialPosition = go.Point.parse(pos);
}

window.addEventListener('DOMContentLoaded', init);