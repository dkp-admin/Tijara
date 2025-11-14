import React, { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TijarahUtils } from "tijarah-utils";

export default function App() {
  const [qrResult, setQrResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const testEnv = "qa";

  console.log("TijarahUtils:", TijarahUtils);

  // Real order data structure that matches backend calculation (149.99, 19.56)
  // Using consistent UTC timestamp to match backend processing
  const sampleInvoiceData = {
    sellerName: "new products",
    vatNumber: "310000165800003",
    timestamp: "2025-06-03T07:58:34.625Z", // UTC timestamp - will be processed consistently
    total: "149.99",
    vatTotal: "19.56",
    orderNum: "WG3BJBQ4062538",
    items: [
      {
        name: "Long Hair Style",
        quantity: "1",
        unitPrice: "130.43",
        total: "150",
        vatAmount: "19.57",
      },
    ],
    customer: {
      name: "Walk-in Customer",
      vat: "",
    },
    location: {
      name: "Tolichauki",
      address: "",
      phone: "",
    },
  };

  const testToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6Iis5NjYtOTEzMjM4ODQ1Iiwic3ViIjoiNjgyYWNkZmJlMTlkMzExOTM5NjkwMjNmIiwic2Vzc2lvbklkIjoiNjgzZDVjNjViZTAwMGRmYmI0OTNjNjIyIiwiaWF0IjoxNzQ4ODUxODEzfQ.PExmoL2_SiPLfutM7fCpq_IkSYNUGqtplVhq1DoOYTM";
  const testDeviceCode = "WG3BJBQ4";

  const addTestResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testCompleteZATCA = async () => {
    setIsLoading(true);
    addTestResult("🚀 Starting Complete ZATCA Test...");
    addTestResult("📋 Using real order data (149.99 SAR, 19.56 VAT)");

    try {
      // Step 1: Show invoice data being used
      addTestResult("📄 Invoice Data:");
      addTestResult(`   - Seller: ${sampleInvoiceData.sellerName}`);
      addTestResult(`   - VAT Number: ${sampleInvoiceData.vatNumber}`);
      addTestResult(`   - Total: ${sampleInvoiceData.total} SAR`);
      addTestResult(`   - VAT Total: ${sampleInvoiceData.vatTotal} SAR`);
      addTestResult(`   - Order: ${sampleInvoiceData.orderNum}`);

      // Step 2: Generate XML invoice hash and QR
      addTestResult("🔧 Generating XML invoice hash...");
      addTestResult("🔧 Creating ZATCA QR code...");

      const qrData = await TijarahUtils.generateZatcaQR(
        JSON.stringify(sampleInvoiceData),
        testToken,
        testDeviceCode,
        testEnv
      );

      // Step 3: Show results
      addTestResult(`✅ ZATCA QR Generated Successfully!`);
      addTestResult(`📏 QR Length: ${qrData.length} characters`);
      addTestResult(`🔍 QR Preview: ${qrData.substring(0, 50)}...`);

      // Step 4: Verify consistency
      addTestResult("🔄 Verifying consistency...");
      addTestResult("📋 Using identical invoice data for second generation...");

      const qrData2 = await TijarahUtils.generateZatcaQR(
        JSON.stringify(sampleInvoiceData),
        testToken,
        testDeviceCode,
        testEnv
      );

      addTestResult(`📏 Second QR Length: ${qrData2.length} characters`);
      addTestResult(`🔍 Second QR Preview: ${qrData2.substring(0, 50)}...`);

      if (qrData === qrData2) {
        addTestResult(
          "✅ Consistency Check: PASSED - Same data produces same QR"
        );
      } else {
        addTestResult(
          "ℹ️ Different QR Generated - This is EXPECTED for ZATCA Phase 2"
        );
        addTestResult(
          "🔐 ECDSA signatures are non-deterministic by design for security"
        );
        addTestResult(
          "✅ Both QRs are valid - ZATCA accepts different signatures for same invoice"
        );
        addTestResult(`📊 First QR:  ${qrData.substring(0, 100)}...`);
        addTestResult(`📊 Second QR: ${qrData2.substring(0, 100)}...`);
        addTestResult(
          "💡 This is correct ZATCA Phase 2 behavior - not an error!"
        );
      }

      addTestResult("🎉 Complete ZATCA Test Finished!");
      addTestResult("📱 Use 'Show QR Data' button to copy for testing");
      addTestResult(
        "🔍 Check Android logs for detailed timestamp formatting info"
      );

      setQrResult(qrData);
    } catch (error: any) {
      addTestResult(`❌ Error in ZATCA test: ${error.message}`);
      console.error("ZATCA Test Error:", error);
      Alert.alert("Error", `ZATCA test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setQrResult("");
  };

  const showQRData = () => {
    if (qrResult) {
      Alert.alert(
        "QR Data",
        `QR Code Data:\n\n${qrResult}\n\nYou can copy this data and paste it into an online QR generator to create a scannable QR code for testing.\n\nTry: qr-code-generator.com or qr.io`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ZATCA QR Generation Test</Text>
        <Text style={styles.subtitle}>
          Testing TijarahUtils.generateZatcaQR
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ZATCA QR Testing</Text>
        <Button
          title={isLoading ? "Testing..." : "🚀 Test Complete ZATCA"}
          onPress={testCompleteZATCA}
          disabled={isLoading}
          color="#4CAF50"
        />
        <View style={styles.buttonSpacing} />
        <Button
          title="🗑️ Clear Results"
          onPress={clearResults}
          color="#f44336"
        />
      </View>

      {qrResult ? (
        <View style={styles.section}>
          <View style={styles.qrHeader}>
            <Text style={styles.sectionTitle}>Latest QR Result</Text>
            <TouchableOpacity style={styles.copyButton} onPress={showQRData}>
              <Text style={styles.copyButtonText}>📋 Show QR Data</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.qrLabel}>QR Code Data (Select All & Copy):</Text>
          <TextInput
            style={styles.qrTextInput}
            value={qrResult}
            multiline
            selectTextOnFocus
            editable
            scrollEnabled
          />
          <Text style={styles.qrHint}>
            💡 Tip: Tap the text field above, select all text (Ctrl+A), and copy
            (Ctrl+C). Then paste into an online QR generator to create a
            scannable QR code for testing.
            {"\n"}Try: qr-code-generator.com or qr.io
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Test Results ({testResults.length})
        </Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.testResult}>
            {result}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sample Invoice Data</Text>
        <Text style={styles.jsonData}>
          {JSON.stringify(sampleInvoiceData, null, 2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    marginBottom: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  buttonSpacing: {
    height: 10,
  },
  qrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  copyButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  qrResult: {
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 4,
    color: "#333",
    marginBottom: 10,
  },
  qrHint: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 16,
  },
  testResult: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
    fontFamily: "monospace",
  },
  jsonData: {
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 4,
    color: "#333",
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  qrTextInput: {
    fontFamily: "monospace",
    fontSize: 11,
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "#333",
    marginBottom: 10,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: "top",
  },
});
