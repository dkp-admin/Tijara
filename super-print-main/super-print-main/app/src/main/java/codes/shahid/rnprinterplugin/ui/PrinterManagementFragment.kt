package codes.shahid.rnprinterplugin.ui

import android.app.Dialog
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import codes.shahid.rnprinterplugin.R
import codes.shahid.rnprinterplugin.database.PrinterDao
import codes.shahid.rnprinterplugin.printer.PrinterManager
import codes.shahid.rnprinterplugin.types.Printer
import codes.shahid.rnprinterplugin.types.KitchenInfo
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.textfield.TextInputLayout
import com.google.android.material.appbar.MaterialToolbar
import java.util.UUID
import java.util.ArrayList

class PrinterManagementFragment : Fragment() {
    private val TAG = "PrinterManagementFragment"

    private lateinit var recyclerView: RecyclerView
    private lateinit var emptyView: TextView
    private lateinit var addButton: FloatingActionButton
    private lateinit var printerDao: PrinterDao
    private lateinit var printerManager: PrinterManager
    private lateinit var adapter: PrinterAdapter

    // Dialog views
    private lateinit var ipAddressLayout: TextInputLayout
    private lateinit var portLayout: TextInputLayout
    private lateinit var macAddressLayout: TextInputLayout
    private lateinit var printerWidthMMLayout: TextInputLayout
    private lateinit var charsPerLineLayout: TextInputLayout
    private lateinit var usbDeviceLayout: TextInputLayout
    private lateinit var sizeAdapter: ArrayAdapter<String>

    // Flag to prevent multiple dialogs from opening
    private var isDialogOpen = false

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        val view = inflater.inflate(R.layout.fragment_printer_management, container, false)

        // Initialize database access and printer manager
        printerDao = PrinterDao(requireContext())
        printerManager = PrinterManager(requireContext())

        // Set up the RecyclerView
        recyclerView = view.findViewById(R.id.recyclerViewPrinters)
        emptyView = view.findViewById(R.id.textViewEmpty)
        addButton = view.findViewById(R.id.fabAddPrinter)

        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        adapter = PrinterAdapter(
            onEditClicked = { printer -> showAddEditPrinterDialog(printer) },
            onDeleteClicked = { printer -> deletePrinter(printer) },
            onTestPrintClicked = { printer -> testPrint(printer) },
            onTestKOTClicked = { printer -> testKOT(printer) }
        )
        recyclerView.adapter = adapter

        // Set up the add button
        addButton.setOnClickListener {
            if (!isDialogOpen) {
                showAddEditPrinterDialog(null)
            }
        }

        return view
    }

    override fun onResume() {
        super.onResume()
        loadPrinters()
    }

    private fun loadPrinters() {
        val printers = printerDao.getAllPrinters()
        adapter.updatePrinters(printers)

        // Show/hide empty view
        if (printers.isEmpty()) {
            recyclerView.visibility = View.GONE
            emptyView.visibility = View.VISIBLE
        } else {
            recyclerView.visibility = View.VISIBLE
            emptyView.visibility = View.GONE
        }
    }

    private fun deletePrinter(printer: Printer) {
        // Show confirmation dialog
        val builder = AlertDialog.Builder(requireContext())
        builder.setTitle("Delete Printer")
            .setMessage("Are you sure you want to delete ${printer.name}?")
            .setPositiveButton("Delete") { _, _ ->
                // User confirmed deletion
                printerDao.deletePrinter(printer.id)
                loadPrinters() // Refresh the list
                Toast.makeText(requireContext(), "Printer deleted successfully", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun testPrint(printer: Printer) {
        Toast.makeText(requireContext(), "Testing receipt print for ${printer.name}", Toast.LENGTH_SHORT).show()
        // The actual implementation would depend on your printer utility class
    }

    private fun testKOT(printer: Printer) {
        Toast.makeText(requireContext(), "Testing KOT print for ${printer.name}", Toast.LENGTH_SHORT).show()
        // The actual implementation would depend on your printer utility class
    }

    private fun showAddEditPrinterDialog(printer: Printer?) {
        // Prevent multiple dialogs from opening
        if (isDialogOpen) return
        isDialogOpen = true

        val isEdit = printer != null
        val dialog = Dialog(requireContext(), R.style.FullScreenDialog)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.dialog_add_printer_fullscreen)

        // Make dialog full screen
        dialog.window?.apply {
            setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            setWindowAnimations(R.style.DialogAnimation)
        }

        // Set up toolbar
        val toolbar = dialog.findViewById<MaterialToolbar>(R.id.toolbar)
        toolbar.title = if (isEdit) "Edit Printer" else "Add Printer"
        toolbar.setNavigationOnClickListener { dialog.dismiss() }

        // Set dismiss listener to reset the flag
        dialog.setOnDismissListener {
            isDialogOpen = false
        }

        // Initialize dialog views
        ipAddressLayout = dialog.findViewById(R.id.textInputLayoutIp)
        portLayout = dialog.findViewById(R.id.textInputLayoutPort)
        macAddressLayout = dialog.findViewById(R.id.textInputLayoutMacAddress)
        printerWidthMMLayout = dialog.findViewById(R.id.textInputLayoutPrinterWidth)
        charsPerLineLayout = dialog.findViewById(R.id.textInputLayoutCharsPerLine)
        usbDeviceLayout = dialog.findViewById(R.id.textInputLayoutUsbDevice)

        // Initialize form fields
        val nameEditText = dialog.findViewById<EditText>(R.id.editTextPrinterName)
        val typeDropdown = dialog.findViewById<AutoCompleteTextView>(R.id.dropdownPrinterType)
        val sizeDropdown = dialog.findViewById<AutoCompleteTextView>(R.id.dropdownPrinterSize)
        val printerWidthMMDropdown = dialog.findViewById<AutoCompleteTextView>(R.id.dropdownPrinterWidthMM)
        val otherPrinterWidthLayout = dialog.findViewById<TextInputLayout>(R.id.textInputLayoutOtherPrinterWidth)
        val otherPrinterWidthEditText = dialog.findViewById<EditText>(R.id.editTextOtherPrinterWidth)
        val charsPerLineDropdown = dialog.findViewById<AutoCompleteTextView>(R.id.dropdownCharsPerLine)
        val otherCharsPerLineLayout = dialog.findViewById<TextInputLayout>(R.id.textInputLayoutOtherCharsPerLine)
        val otherCharsPerLineEditText = dialog.findViewById<EditText>(R.id.editTextOtherCharsPerLine)
        val ipAddressEditText = dialog.findViewById<EditText>(R.id.editTextIp)
        val portEditText = dialog.findViewById<EditText>(R.id.editTextPort)
        val macAddressEditText = dialog.findViewById<EditText>(R.id.editTextMacAddress)
        val enableReceiptsCheckBox = dialog.findViewById<CheckBox>(R.id.checkBoxEnableReceipts)
        val enableKOTCheckBox = dialog.findViewById<CheckBox>(R.id.checkBoxEnableKOT)
        val enableBarcodesCheckBox = dialog.findViewById<CheckBox>(R.id.checkBoxEnableBarcodes)
        val kitchenLayout = dialog.findViewById<TextInputLayout>(R.id.textInputLayoutKitchen)
        val kitchenEditText = dialog.findViewById<EditText>(R.id.editTextKitchen)
        val numberOfPrintsLayout = dialog.findViewById<TextInputLayout>(R.id.textInputLayoutNumberOfPrints)
        val numberOfPrintsEditText = dialog.findViewById<EditText>(R.id.editTextNumberOfPrints)
        val numberOfKotPrintsLayout = dialog.findViewById<TextInputLayout>(R.id.textInputLayoutNumberOfKotPrints)
        val numberOfKotPrintsEditText = dialog.findViewById<EditText>(R.id.editTextNumberOfKotPrints)
        val saveButton = dialog.findViewById<Button>(R.id.buttonSave)
        val usbDeviceDropdown = dialog.findViewById<AutoCompleteTextView>(R.id.dropdownUsbDevice)

        // Set up printer type dropdown with mutable list
        val printerTypes = ArrayList<String>().apply {
            add("USB")
            add("Bluetooth")
            add("LAN")
            add("Sunmi")
            add("Neoleap")
        }
        val typeAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, printerTypes)
        typeDropdown.setAdapter(typeAdapter)

        // Set up printer size dropdown with mutable lists
        val printerSizes = ArrayList<String>().apply {
            add("2-inch")
            add("3-inch")
        }
        sizeAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, printerSizes)
        sizeDropdown.setAdapter(sizeAdapter)

        // Add listener for printer size dropdown
        sizeDropdown.setOnItemClickListener { _, _, _, _ ->
            val selectedSize = sizeDropdown.text.toString()
            // Set default values based on printer size
            when (selectedSize) {
                "2-inch" -> {
                    printerWidthMMDropdown.setText("58", false)
                    charsPerLineDropdown.setText("32", false)
                }
                "3-inch" -> {
                    printerWidthMMDropdown.setText("72", false)
                    charsPerLineDropdown.setText("48", false)
                }
            }
        }

        // Set up printer width dropdown
        val printerWidths = ArrayList<String>().apply {
            add("58")  // For 2-inch printers
            add("72")  // For 3-inch printers
            add("77")  // For 3-inch printers
            add("Custom")
        }
        val widthAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, printerWidths)
        printerWidthMMDropdown.setAdapter(widthAdapter)

        // Add listener for printer width dropdown
        printerWidthMMDropdown.setOnItemClickListener { _, _, _, _ ->
            val selectedWidth = printerWidthMMDropdown.text.toString()
            if (selectedWidth == "Custom") {
                otherPrinterWidthLayout.visibility = View.VISIBLE
            } else {
                otherPrinterWidthLayout.visibility = View.GONE
            }
        }

        // Set up chars per line dropdown
        val charsPerLineOptions = ArrayList<String>().apply {
            add("32")  // For 2-inch printers
            add("48")  // For 3-inch printers
            add("Custom")
        }
        val charsAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, charsPerLineOptions)
        charsPerLineDropdown.setAdapter(charsAdapter)

        // Add listener for chars per line dropdown
        charsPerLineDropdown.setOnItemClickListener { _, _, _, _ ->
            val selectedChars = charsPerLineDropdown.text.toString()
            if (selectedChars == "Custom") {
                otherCharsPerLineLayout.visibility = View.VISIBLE
            } else {
                otherCharsPerLineLayout.visibility = View.GONE
            }
        }

        // Get USB devices and filter out already configured ones
        val allUsbDevices = printerManager.getUsbDevices()
        val existingPrinters = printerDao.getAllPrinters()
        val existingUsbProductIds = existingPrinters
            .filter { it.printerType.lowercase() == "usb" && it.productId.isNotEmpty() }
            .map { it.productId }
            .toSet()

        // Filter USB devices - exclude already configured ones, but include current device if editing
        val usbDevices = allUsbDevices.filter { device ->
            val productId = device["productId"]?.toString() ?: ""
            // Include device if it's not already configured, or if we're editing and this is the current device
            !existingUsbProductIds.contains(productId) ||
            (isEdit && printer != null && printer.productId == productId)
        }

        val usbDeviceNames = usbDevices.map { device ->
            "${device["deviceName"]} (${device["productId"]})"
        }
        var selectedUsbDevice: Map<String, Any>? = null

        val usbDeviceAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, usbDeviceNames)
        usbDeviceDropdown.setAdapter(usbDeviceAdapter)

        // Show/hide fields based on printer type
        typeDropdown.setOnItemClickListener { _, _, position, _ ->
            val selectedType = printerTypes[position].lowercase()
            updateFieldsVisibility(selectedType)

            // Set default port value when LAN printer is selected
            if (selectedType == "lan") {
                portEditText.setText("9100")
            }
        }

        // Handle USB device selection
        usbDeviceDropdown.setOnItemClickListener { _, _, position, _ ->
            selectedUsbDevice = usbDevices[position]
        }

        // Handle Receipt checkbox change
        enableReceiptsCheckBox.setOnCheckedChangeListener { _, isChecked ->
            numberOfPrintsLayout.visibility = if (isChecked) View.VISIBLE else View.GONE
        }

        // Handle KOT checkbox change
        enableKOTCheckBox.setOnCheckedChangeListener { _, isChecked ->
            kitchenLayout.visibility = if (isChecked) View.VISIBLE else View.GONE
            numberOfKotPrintsLayout.visibility = if (isChecked) View.VISIBLE else View.GONE
        }

        // If editing, populate the fields
        if (isEdit && printer != null) {
            nameEditText.setText(printer.name)
            val selectedType = printer.printerType.replaceFirstChar { it.uppercase() }
            typeDropdown.setText(selectedType, false)

            // Set printer size
            sizeDropdown.setText(printer.printerSize, false)

            // Set printer width
            if (printer.printerWidthMM in listOf("58", "72", "77")) {
                printerWidthMMDropdown.setText(printer.printerWidthMM, false)
                otherPrinterWidthLayout.visibility = View.GONE
            } else {
                printerWidthMMDropdown.setText("Custom", false)
                otherPrinterWidthEditText.setText(printer.printerWidthMM)
                otherPrinterWidthLayout.visibility = View.VISIBLE
            }

            // Set chars per line
            if (printer.charsPerLine in listOf("32", "48")) {
                charsPerLineDropdown.setText(printer.charsPerLine, false)
                otherCharsPerLineLayout.visibility = View.GONE
            } else {
                charsPerLineDropdown.setText("Custom", false)
                otherCharsPerLineEditText.setText(printer.charsPerLine)
                otherCharsPerLineLayout.visibility = View.VISIBLE
            }

            // Set number of prints
            numberOfPrintsEditText.setText(printer.numberOfPrints.toString())

            // Set number of KOT prints
            numberOfKotPrintsEditText.setText(printer.numberOfKotPrints.toString())

            // Set USB device if this is a USB printer
            if (printer.printerType.lowercase() == "usb" && printer.productId.isNotEmpty()) {
                val matchingDevice = usbDevices.find { it["productId"] == printer.productId }
                if (matchingDevice != null) {
                    val deviceIndex = usbDevices.indexOf(matchingDevice)
                    if (deviceIndex >= 0) {
                        usbDeviceDropdown.setText(usbDeviceNames[deviceIndex], false)
                        selectedUsbDevice = matchingDevice
                    }
                }
            }

            // Set IP and Port for LAN printers
            if (printer.printerType.lowercase() == "lan") {
                ipAddressEditText.setText(printer.ip)
                portEditText.setText(printer.port.toString())
            }

            // Set printer options
            enableReceiptsCheckBox.isChecked = printer.enableReceipts
            enableKOTCheckBox.isChecked = printer.enableKOT
            enableBarcodesCheckBox.isChecked = printer.enableBarcodes

            // Set visibility based on enabled features
            numberOfPrintsLayout.visibility = if (printer.enableReceipts) View.VISIBLE else View.GONE
            numberOfKotPrintsLayout.visibility = if (printer.enableKOT) View.VISIBLE else View.GONE

            // Set kitchen if KOT is enabled
            if (printer.enableKOT) {
                kitchenLayout.visibility = View.VISIBLE
                val kitchenId = printer.kitchenIds.takeIf { it.isNotEmpty() } ?: printer.kitchenRef
                if (!kitchenId.isNullOrEmpty()) {
                    kitchenEditText.setText(kitchenId)
                }
            }

            updateFieldsVisibility(printer.printerType.lowercase())
        }

        // Handle save button
        saveButton.setOnClickListener {
            val name = nameEditText.text.toString()
            val selectedType = typeDropdown.text.toString().lowercase()
            // Convert "network" to "lan" for storage
            val type = if (selectedType == "network") "lan" else selectedType
            val size = sizeDropdown.text.toString()

            // Get printer width MM
            val printerWidthMM = if (printerWidthMMDropdown.text.toString() == "Custom") {
                otherPrinterWidthEditText.text.toString()
            } else {
                printerWidthMMDropdown.text.toString()
            }

            // Get chars per line
            val charsPerLine = if (charsPerLineDropdown.text.toString() == "Custom") {
                otherCharsPerLineEditText.text.toString()
            } else {
                charsPerLineDropdown.text.toString()
            }

            val ip = ipAddressEditText.text.toString()
            val portStr = portEditText.text.toString()
            val port = if (portStr.isNotEmpty()) portStr.toInt() else 9100
            val macAddress = macAddressEditText.text.toString()
            val enableReceipts = enableReceiptsCheckBox.isChecked
            val enableKOT = enableKOTCheckBox.isChecked
            val enableBarcodes = enableBarcodesCheckBox.isChecked

            // Get selected kitchen
            val kitchenId = kitchenEditText.text.toString()

            // Get number of prints
            val numberOfPrintsStr = numberOfPrintsEditText.text.toString()
            val numberOfPrints = if (numberOfPrintsStr.isNotEmpty()) {
                val num = numberOfPrintsStr.toIntOrNull() ?: 1
                if (num < 1) 1 else if (num > 3) 3 else num
            } else 1

            // Get number of KOT prints
            val numberOfKotPrintsStr = numberOfKotPrintsEditText.text.toString()
            val numberOfKotPrints = if (numberOfKotPrintsStr.isNotEmpty()) {
                val num = numberOfKotPrintsStr.toIntOrNull() ?: 1
                if (num < 1) 1 else if (num > 3) 3 else num
            } else 1

            // Validate input
            if (name.isBlank()) {
                nameEditText.error = "Name is required"
                return@setOnClickListener
            }

            if (selectedType == "lan") {
                if (ip.isBlank()) {
                    ipAddressEditText.error = "IP Address is required"
                    return@setOnClickListener
                }
                if (portStr.isBlank()) {
                    portEditText.error = "Port is required"
                    return@setOnClickListener
                }
            }

            if (selectedType == "usb" && selectedUsbDevice == null) {
                Toast.makeText(requireContext(), "Please select a USB device", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val updatedPrinter = Printer(
                id = if (isEdit) printer!!.id else UUID.randomUUID().toString(),
                name = name,
                deviceName = selectedUsbDevice?.get("deviceName")?.toString() ?: name,
                printerType = type,
                printerSize = size,
                ip = ip,
                port = port,
                macAddress = if (selectedType == "bluetooth") "SelectFirstPaired" else macAddress,
                deviceId = selectedUsbDevice?.get("id")?.toString() ?: "",
                productId = selectedUsbDevice?.get("productId")?.toString() ?: "",
                vendorId = selectedUsbDevice?.get("vendorId")?.toString() ?: "",
                enableReceipts = enableReceipts,
                enableKOT = enableKOT,
                enableBarcodes = enableBarcodes,
                printerWidthMM = printerWidthMM,
                charsPerLine = charsPerLine,
                kitchenRef = kitchenId,
                kitchenIds = kitchenId,
                kitchen = if (kitchenId.isNotEmpty()) KitchenInfo("Kitchen $kitchenId") else null,
                model = selectedType,
                numberOfPrints = numberOfPrints,
                numberOfKotPrints = numberOfKotPrints
            )

            if (isEdit) {
                printerDao.updatePrinter(updatedPrinter)
                Toast.makeText(requireContext(), "Printer updated successfully", Toast.LENGTH_SHORT).show()
            } else {
                printerDao.insertPrinter(updatedPrinter)
                Toast.makeText(requireContext(), "Printer added successfully", Toast.LENGTH_SHORT).show()
            }

            dialog.dismiss()
            loadPrinters() // Refresh the list
        }

        dialog.show()
    }

    private fun updateFieldsVisibility(selectedType: String) {
        when (selectedType) {
            "lan" -> {
                ipAddressLayout.visibility = View.VISIBLE
                portLayout.visibility = View.VISIBLE
                macAddressLayout.visibility = View.GONE
                usbDeviceLayout.visibility = View.GONE
                printerWidthMMLayout.visibility = View.VISIBLE
                charsPerLineLayout.visibility = View.VISIBLE
            }
            "bluetooth" -> {
                ipAddressLayout.visibility = View.GONE
                portLayout.visibility = View.GONE
                macAddressLayout.visibility = View.VISIBLE
                usbDeviceLayout.visibility = View.GONE
                printerWidthMMLayout.visibility = View.VISIBLE
                charsPerLineLayout.visibility = View.VISIBLE
            }
            "usb" -> {
                ipAddressLayout.visibility = View.GONE
                portLayout.visibility = View.GONE
                macAddressLayout.visibility = View.GONE
                usbDeviceLayout.visibility = View.VISIBLE
                printerWidthMMLayout.visibility = View.VISIBLE
                charsPerLineLayout.visibility = View.VISIBLE
            }
            "sunmi", "neoleap" -> {
                ipAddressLayout.visibility = View.GONE
                portLayout.visibility = View.GONE
                macAddressLayout.visibility = View.GONE
                usbDeviceLayout.visibility = View.GONE
                printerWidthMMLayout.visibility = View.VISIBLE
                charsPerLineLayout.visibility = View.VISIBLE
            }
        }
    }

    // Inner adapter class for the printer recycler view
    inner class PrinterAdapter(
        private val onEditClicked: (Printer) -> Unit,
        private val onDeleteClicked: (Printer) -> Unit,
        private val onTestPrintClicked: (Printer) -> Unit,
        private val onTestKOTClicked: (Printer) -> Unit
    ) : RecyclerView.Adapter<PrinterAdapter.PrinterViewHolder>() {

        private var printers: List<Printer> = emptyList()

        fun updatePrinters(newPrinters: List<Printer>) {
            this.printers = newPrinters
            notifyDataSetChanged()
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PrinterViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_printer, parent, false)
            return PrinterViewHolder(view)
        }

        override fun onBindViewHolder(holder: PrinterViewHolder, position: Int) {
            val printer = printers[position]
            holder.bind(printer)
        }

        override fun getItemCount(): Int = printers.size

        inner class PrinterViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            private val nameTextView: TextView = itemView.findViewById(R.id.textViewPrinterName)
            private val typeTextView: TextView = itemView.findViewById(R.id.textViewPrinterType)
            private val detailsTextView: TextView = itemView.findViewById(R.id.textViewPrinterDetails)
            private val enabledTextView: TextView = itemView.findViewById(R.id.textViewPrinterEnabled)
            private val editButton: Button = itemView.findViewById(R.id.buttonEdit)
            private val deleteButton: Button = itemView.findViewById(R.id.buttonDelete)


            fun bind(printer: Printer) {
                nameTextView.text = printer.name
                typeTextView.text = "Type: ${printer.printerType.replaceFirstChar { it.uppercase() }}"

                val details = when (printer.printerType.lowercase()) {
                    "network" -> "IP: ${printer.ip}:${printer.port}"
                    "bluetooth" -> "Auto-connect to first paired device"
                    "sunmi", "neoleap" -> "Model: ${printer.model}, Size: ${printer.printerSize}"
                    else -> "Size: ${printer.printerSize}, Width: ${printer.printerWidthMM}mm, Chars: ${printer.charsPerLine}" +
                            if (printer.productId.isNotBlank()) ", Product ID: ${printer.productId}" else ""
                }
                detailsTextView.text = details

                val enabledText = StringBuilder()
                if (printer.enableReceipts) enabledText.append("Receipts: Yes")
                else enabledText.append("Receipts: No")

                enabledText.append(", KOT: ")
                enabledText.append(if (printer.enableKOT) "Yes" else "No")

                if (printer.kitchen != null && printer.kitchen.name != null) {
                    enabledText.append(", Kitchen: ${printer.kitchen.name}")
                }

                enabledTextView.text = enabledText

                editButton.setOnClickListener { onEditClicked(printer) }
                deleteButton.setOnClickListener { onDeleteClicked(printer) }


            }
        }
    }
}