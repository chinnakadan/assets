import React, { useState, useRef, useEffect } from "react";
import { View, Image, ScrollView, TouchableOpacity, Button, Text, StyleSheet, BackHandler, Platform, } from "react-native";
import ViewShot from "react-native-view-shot";
var RNFS = require("react-native-fs");
import Share from "react-native-share";
import AsyncStorage from "@react-native-community/async-storage";
import { Template } from "../../../service/api/apiservice";
import { FlatList, TextInput } from "react-native-gesture-handler";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Entypo";
import Icon1 from "react-native-vector-icons/Fontisto";
// Import HTML to PDF
import RNHTMLtoPDF from 'react-native-html-to-pdf';
// Import RNPrint
import RNPrint from 'react-native-print';
import { template } from "@babel/core";
import Loader from "../../Components/Loader";
import { FONTCOLORS } from "../../theme/theme";
const TReceiptTemplate = (props) => {
    const { RegisterId } = props.route.params;
    const viewShotRef = useRef(null);
    const [isSharingView, setSharingView] = useState(false);
    const [ClientId, setClientId] = useState('');
    const [UserId, setUserId] = useState('');
    const [entryType, setentryType] = useState('Asset Transfer - Receipt');
    const [approve, setApprove] = useState('N');
    const [remarks, setRemarks] = React.useState("");
    const [refdate, setRefdate] = React.useState("");
    const [desdate, setDesdate] = React.useState("");
    const [recdate, setRecdate] = React.useState("");
    const [refNo, setRefNo] = React.useState("");
    const [CCName, setCCName] = useState('');
    const [TCCName, setTCCName] = useState('');
    const [delivered, setDelivered] = useState('');
    const [vehicleNo, setvehicleNo] = useState('');
    const [operatorName, setoperatorName] = useState('');
    const [transdata, settransdata] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState(null);
    const [transhtml, settranshtml] = React.useState("");
    const [rshare, setrShare] = useState(0);
    const [rprint, setrPrint] = useState(0);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        retrieveData();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, [ClientId, UserId]);
    useEffect(() => {
    }, [CCName]);
    useEffect(() => {
        updatehtml();
    }, [transdata]);
    function handleBackButtonClick() {
        props.navigation.navigate('TransferRegister');
        return true;
    }
    function closeScreen() {
        props.navigation.navigate('TransferRegister');
    }
    const retrieveData = async () => {
        try {
            setLoading(true);
            let iClientId = await AsyncStorage.getItem('clientId');
            let iUserId = await AsyncStorage.getItem('userId');
            setClientId(iClientId);
            setUserId(iUserId);
            if (RegisterId != 0) {
                let data = {
                    ClientId: iClientId,
                    UserId: iUserId,
                    RegisterId: RegisterId,
                    type: 'getreceipttransfer'
                };
                const response = await Template(data);
                const datas = await response.json();
                const RegData = datas.regList;
                setCCName(RegData.FCostCentreName);
                setTCCName(RegData.TCostCentreName);
                setRefNo(RegData.RefNo);
                setRefdate(RegData.RefDate);
                setDesdate(RegData.DespatchDate);
                setRecdate(RegData.ReceiptDate);
                setvehicleNo(RegData.VehicleNo);
                setoperatorName(RegData.OperatorName);
                setApprove(RegData.Approve);
                setRemarks(RegData.Narration);
                settransdata(datas.transList);
                setrShare(datas.share);
                setrPrint(datas.print);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error)
        }
    }
    const captureAndShareScreenshot = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            const res = await RNFS.readFile(uri, "base64");
            const urlString = `data:image/jpeg;base64,${res}`;
            const info = '';
            const filename = '';
            const options = {
                title: info,
                message: info,
                url: urlString,
                type: "image/jpeg",
                filename: filename,
                subject: info,
            };
            await Share.open(options);
            setSharingView(false);
        } catch (error) {
            setSharingView(false);
            console.log("shareScreenshot error:", error);
        }
        setLoading(false);
    };
    // Only for iOS
    const selectPrinter = async () => {
        const selectedPrinter =
            await RNPrint.selectPrinter({ x: 100, y: 100 });
        setSelectedPrinter(selectedPrinter);
    };
    // Only for iOS
    const silentPrint = async () => {
        if (!selectedPrinter) {
            alert('Must Select Printer First');
        }
        const jobName = await RNPrint.print({
            printerURL: selectedPrinter.url,
            html: '<h1>Silent Print clicked</h1>',
        });
    };
    const printPDF = async () => {
        const results = await RNHTMLtoPDF.convert({
            html: htmlContent,
            fileName: 'test',
            base64: true,
        });
        await RNPrint.print({ filePath: results.filePath });
    };
    function updatehtml() {
        let shtml = '';
        transdata.map((userData) => {
            shtml = shtml + `<tr class="header">
            <td colspan='6' style="width:50%;">${userData.AssetName}</td>
            <td class="myAlign"></td>
            <td colspan='2' style="width:20%;">${userData.DespatchQty}</td>
            <td class="myAlign"></td>
            <td colspan='2' style="width:20%;">${userData.ReceiptQty}</td>
            <td class="myAlign"></td>
            <td colspan='2' style="width:10%;"> ${userData.UnitName} </td>
     </tr>`;
        });
        settranshtml(shtml);
    }
    const htmlContent = `
    <html>
        <head>
        <meta charset="utf-8">
        <title>Transfer</title>
        <link rel="license" href="https://www.opensource.org/licenses/mit-license/">
        <style>
            ${htmlStyles}
        </style>
        </head>
        <body>
        <div class="salary-slip" >
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-12 ">
                <p class="companyName"> ${entryType}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-3 bg-success">
                <p style="padding: 0px 15px 0px 15px"> Ref No</p>
                <p style="padding: 0px 15px 0px 15px"> Date</p>
                <p style="padding: 0px 15px 0px 15px"> From Costcenter</p>
                <p style="padding: 0px 15px 0px 15px"> To Costcenter</p>
                <p style="padding: 0px 15px 0px 15px"> Vehicle No</p>
                <p style="padding: 0px 15px 0px 15px"> Operator Name</p>
                <p style="padding: 0px 15px 0px 15px"> Approved</p>
                <p style="padding: 0px 15px 0px 15px"> Dispatched on</p>
                <p style="padding: 0px 15px 0px 15px"> Received on</p>
                <p style="padding: 0px 15px 0px 15px"> Narration</p>
            </div>
            <div class="col-sm-9 ">
                <p> : ${refNo} </p>
                <p> : ${refdate}</p>
                <p> : ${CCName}</p>
                <p> : ${TCCName}</p>
                <p> : ${vehicleNo}</p>
                <p> : ${operatorName}</p>
                <p> : ${approve}</p>
                <p> : ${desdate}</p>
                <p> : ${recdate}</p>
                <p> : ${remarks}</p>
            </div>
        </div>
    </div>
    <tr>
        <table id="myTable">
            <tr class="header">
                <th colspan='6' style="width:50%;">
                <label class="border-center"> Asset Name</label>
                </th>
                <th class="myAlign"></th>
                <th colspan='2' style="width:20%;">Despatch </th>
                <th class="myAlign"></th>
                <th colspan='2' style="width:20%;">Receipt </th>
                <th class="myAlign"></th>
                <th colspan='2' style="width:10%;">Unit</th>
            </tr>
            ${transhtml}
        </table >
    </div >
    </body>
  </html>`;
    const customOptions = () => {
        return (
            <View>
                {selectedPrinter && (
                    <View>
                        <Text>
                            {`Selected Printer Name: ${selectedPrinter.name}`}
                        </Text>
                        <Text>
                            {`Selected Printer URI: ${selectedPrinter.url}`}
                        </Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={selectPrinter}>
                    <Text>Click to Select Printer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={silentPrint}>
                    <Text>Click for Silent Print</Text>
                </TouchableOpacity>
            </View>
        );
    };
    return (
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0 }}>
            <Loader loading={loading} />
            <View><TouchableOpacity style={styles.touch}>
                <View style={styles.Flatlistview} >
                    <View style={{ width: '70%' }}>
                        <Text style={styles.itemTitledate} >{entryType}</Text>
                    </View>
                    <View style={rshare == 0 ? styles.hide : { width: '10%' }}>
                        <TouchableOpacity onPress={captureAndShareScreenshot}>
                            <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 5, borderRadius: 5, }}>
                                <View  >
                                    <Icon2 name="share-variant" type="ionicon" color={COLORS.primary} size={20} style={{}} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={rprint == 0 ? styles.hide : { width: '10%' }}>
                        <TouchableOpacity onPress={printPDF}>
                            <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 5, borderRadius: 5, }}>
                                <View  >
                                    <Icon1 name="download" type="ionicon" color={COLORS.primary} size={20} style={{}} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '10%' }}>
                        <TouchableOpacity onPress={closeScreen}>
                            <View style={{ flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 5, }}>
                                <View  >
                                    <Icon name="cross" type="ionicon" color={COLORS.primary} size={25} style={{}} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col50}>
                        <Text style={styles.assetname}>{refNo}</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col50}>
                        <Text style={[styles.assetname, { textAlign: 'right' }]}>{refdate}</Text>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col3}>
                        <Text style={styles.itemtittle}>From CostCentre</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col7}>
                        <Text style={styles.assetname}>{CCName}</Text>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col3}>
                        <Text style={styles.itemtittle}>To CostCentre</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col7}>
                        <Text style={styles.assetname}>{TCCName}</Text>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col3}>
                        <Text style={styles.itemtittle}>Vehicle No</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col7}>
                        <Text style={styles.assetname}>{vehicleNo}</Text>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col3}>
                        <Text style={styles.itemtittle}>Operator Name</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col7}>
                        <Text style={styles.assetname}>{operatorName}</Text>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col3}>
                        <Text style={styles.itemtittle} >Approve</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col7}>
                        <Text style={styles.assetname}>{approve}</Text>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col3}>
                        <Text style={styles.itemtittle} >Dispatched on</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col7}>
                        <Text style={styles.assetname}>{desdate}</Text>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col3}>
                        <Text style={styles.itemtittle} >Received on</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col7}>
                        <Text style={styles.assetname}>{recdate}</Text>
                    </View>
                </View>
                <View style={styles.Flatlistview} >
                    <View style={styles.col3}>
                        <Text style={styles.itemtittle} >Narration</Text>
                    </View>
                    <Text style={styles.colon}>: </Text>
                    <View style={styles.col7}>
                        <Text style={styles.assetname}>{remarks}</Text>
                    </View>
                </View>
            </TouchableOpacity>
                <TouchableOpacity style={styles.touch}>
                    <View style={{ marginBottom: 5, height: '81%' }}>
                        <View style={styles.Flatlistview}>
                            <View style={styles.col4}>
                                <Text style={styles.itemTitle2}>Asset Name</Text>
                            </View>
                            <View style={styles.col3}>
                                <Text style={styles.itemTitle2}>Despatch</Text>
                            </View>
                            <View style={styles.col3}>
                                <Text style={styles.itemTitle2}>Receipt</Text>
                            </View>
                            <View style={styles.col10}>
                                <Text style={styles.itemTitle2}>Unit</Text>
                            </View>
                        </View>
                        {/* <ScrollView> */}
                            <FlatList style={[styles.flatlist, { marginTop: 5 }]}
                                data={transdata}
                                keyExtractor={item => item.AssetId}
                                renderItem={({ item, index }) => {
                                    return <View  ><TouchableOpacity>
                                        <View style={styles.Flatlistview}>
                                            <View style={styles.col4}>
                                                <Text style={styles.assetname}>{item.AssetName}</Text>
                                            </View>
                                            <View style={styles.col3}>
                                                <Text style={styles.assetname}>{item.DespatchQty}</Text>
                                            </View>
                                            <View style={styles.col3}>
                                                <Text style={styles.assetname}>{item.ReceiptQty}</Text>
                                            </View>
                                            <View style={styles.col10}>
                                                <Text style={styles.assetname}>{item.UnitName}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    </View>
                                }}
                            />
                        {/* </ScrollView> */}
                    </View>
                </TouchableOpacity>
            </View>
        </ViewShot>
    )
}
export default TReceiptTemplate;
const styles = StyleSheet.create({
    touch: {
        flexDirection: 'column',
        backgroundColor: 'white',
        padding: 5,
        justifyContent: 'flex-start',
        borderWidth: 1,
        borderColor: '#edece8',
        fontSize: 24,
        fontWeight: 'bold',
        shadowColor: "#000",
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 3,
        width: '100%',
    },
    hide: {
        display: 'none'
    },
    flatlist: {
        fontSize: 15,
        paddingVertical: 5,
        paddingHorizontal: 0,
        fontWeight: 'bold',
        color: 'blue',
        // marginBottom: 250,
        height: '99%',
        overflow: 'scroll'
    },
    Flatlistview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        //height: 30,
    },

    container: {
        flex: 1,
        backgroundColor: '#edece8',
    },

    itemTitledate: {
        color: FONTCOLORS.primary,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    assetname: {
        color: '#003885',
        textAlign: 'left',
        fontSize: 13,
        paddingLeft: 0,
        paddingTop: 2,
    },
    unit:
    {
        fontSize: 12,
    },
    col4: {
        width: '40%',
    },
    col50: {
        width: '50%',
    },
    col3: {
        width: '26%',
    },
    col7: {
        width: '50%',
    },
    col60: {
        width: '80%',
    },
    col10: {
        width: '10%',
    },
    colon: {
        paddingTop: 10,
        width: '1%',
    },
    itemtittle: {
        paddingTop: 10,
        color: '#5c6773',
        fontWeight: 'normal',
    },
    itemTitle2: {
        textAlign: 'left',
        fontSize: 13,
        marginTop: 0,
        width: '100%',
        color: '#464854'
    },
})
const htmlStyles = `
.salary-slip {
	margin:5;
}
.empDetail {
	width: 99%;
	text-align: left;
	border: 2px solid black;
	border-collapse: collapse;
	table-layout: fixed;
}
.container-fluid {
	width: 99%;
	padding-right: 15px;
	padding-left: 15px;
	margin-right: auto;
	margin-left: auto;
}
.row {
	display: -ms-flexbox;
	display: flex;
	-ms-flex-wrap: wrap;
	flex-wrap: wrap;
	// margin-right: -15px;
	 margin-left: -15px;
	border: 1px solid black;
}
.col-sm-3 {
	-ms-flex: 0 0 30%;
	flex: 0 0 30%;
	max-width: 30%;
	height: 20 !important;
}
.col-sm-12 {
	-ms-flex: 0 0 100%;
	flex: 0 0 100%;
	max-width: 100%;
	background-color: #c2d69b;
	height: 50
}
.col-sm-9 {
	-ms-flex: 0 0 60%;
	flex: 0 0 60%;
	max-width: 60%;
}
.companyName {
	text-align: Center;
	font-size: 20px;
	font-weight: bold;
  line-height:0.4
}
.table-border-bottom {
	border-bottom: 1px solid;
}
.myAlign {
	text-align: center;
	border-right: 1px solid black;
}
.border-center {
	text-align: center;
}
th,
td {
	padding-left: 6px;
}
.quantity {
	text-align: right;
}
#myTable {
	border-collapse: collapse;
	width: 101.2%;
	border: 1px solid black;
	font-size: 18px;
	margin-top: -1;
}
p {
	padding-left: 5;
	line-height: 0.5;
}
#myTable th,
#myTable td {
	text-align: left;
	padding: 12px;
}
#myTable tr {
	border-bottom: 1px solid black;
}
#myTable tr.header,
#myTable tr:hover {
	background-color: #f1f1f1;
	padding-top: 10px;
	text-align: left;
	border: 1px solid black;
	height: 40px;
}
.col-sm-9>p {
	padding-left: 30;
}`;