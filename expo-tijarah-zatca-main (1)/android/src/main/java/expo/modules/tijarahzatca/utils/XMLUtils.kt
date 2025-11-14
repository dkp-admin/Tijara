package expo.modules.tijarahzatca.utils

fun extractXMLValue(xml: String, path: String): String? {
    if (path.contains("/")) {
        val parts = path.split("/")
        var currentXml = xml

        for (i in 0 until parts.size - 1) {
            val tagName = parts[i]
            val regex = "<$tagName[^>]*>(.*?)</$tagName>".toRegex(RegexOption.DOT_MATCHES_ALL)
            val match = regex.find(currentXml)
            currentXml = match?.groupValues?.get(1) ?: return null
        }

        val finalTag = parts.last()
        val regex = "<$finalTag[^>]*>([^<]*)</$finalTag>".toRegex()
        val match = regex.find(currentXml)
        return match?.groupValues?.get(1)?.trim()
    } else {
        val regex = "<$path[^>]*>([^<]*)</$path>".toRegex()
        val match = regex.find(xml)
        return match?.groupValues?.get(1)?.trim()
    }
}

fun extractXMLAttribute(xml: String, tagName: String, attributeName: String): String? {
    val regex = "<$tagName[^>]*$attributeName=\"([^\"]*)\">".toRegex()
    val match = regex.find(xml)
    return match?.groupValues?.get(1)?.trim()
}


fun addXMLElements(
    invoice_xml: String,
    taxTotalArray: List<Map<String, Any>>,
    legalMonetaryTotal: Map<String, Any>,
    invoice_line_items: List<Map<String, Any>>,
    customerParty: Map<String, Any>
): String {
    var result = invoice_xml

    // Add customer party first (after AccountingSupplierParty, before totals)
    result = addXMLElementAfter(
        result,
        "cac:AccountingCustomerParty",
        customerParty,
        "</cac:AccountingSupplierParty>"
    )

    // Add TaxTotal elements
    taxTotalArray.forEach { taxTotal ->
        result = addXMLElement(result, "cac:TaxTotal", taxTotal)
    }

    // Add LegalMonetaryTotal
    result = addXMLElement(result, "cac:LegalMonetaryTotal", legalMonetaryTotal)

    // Add InvoiceLine elements
    invoice_line_items.forEach { lineItem ->
        result = addXMLElement(result, "cac:InvoiceLine", lineItem)
    }

    return result
}

fun addXMLElement(
    xml: String,
    elementName: String,
    elementData: Map<String, Any>
): String {
    val xmlElement =
        mapToXML(elementData, elementName, 1) // Use 1 indent level for 4-space indentation
    val insertPosition = xml.lastIndexOf("</Invoice>")
    return if (insertPosition != -1) {
        xml.substring(0, insertPosition) + xmlElement + xml.substring(insertPosition)
    } else {
        xml + xmlElement
    }
}

fun addXMLElementAfter(
    xml: String,
    elementName: String,
    elementData: Map<String, Any>,
    afterElement: String
): String {
    val xmlElement =
        mapToXML(elementData, elementName, 1) // Use 1 indent level for 4-space indentation
    val insertPosition = xml.indexOf(afterElement)
    return if (insertPosition != -1) {
        val afterPosition = insertPosition + afterElement.length
        // Check if there's already a newline after the afterElement
        val hasNewlineAfter = afterPosition < xml.length && xml[afterPosition] == '\n'
        if (hasNewlineAfter) {
            // Insert after the existing newline
            xml.substring(0, afterPosition + 1) + xmlElement + xml.substring(afterPosition + 1)
        } else {
            // Add newline before inserting
            xml.substring(0, afterPosition) + "\n" + xmlElement + xml.substring(afterPosition)
        }
    } else {
        // Fallback to adding before </Invoice>
        addXMLElement(xml, elementName, elementData)
    }
}

fun mapToXML(
    data: Map<String, Any>,
    rootElement: String? = null,
    indentLevel: Int = 0
): String {
    val sb = StringBuilder()
    val indent = "    ".repeat(indentLevel) // 4 spaces per indent level

    if (rootElement != null) {
        // Collect attributes first
        val attributes = mutableListOf<String>()
        var textContent = ""
        val childElements = mutableMapOf<String, Any>()

        data.forEach { (key, value) ->
            when {
                key.startsWith("@_") -> {
                    // Handle attributes: @_currencyID -> currencyID="SAR"
                    val attrName = key.substring(2) // Remove @_ prefix
                    attributes.add("$attrName=\"$value\"")
                }

                key == "#text" -> {
                    textContent = value.toString()
                }

                else -> {
                    childElements[key] = value
                }
            }
        }

        // Build opening tag with attributes and proper indentation
        sb.append(indent)
        if (attributes.isNotEmpty()) {
            sb.append("<$rootElement ${attributes.joinToString(" ")}>")
        } else {
            sb.append("<$rootElement>")
        }

        // Add text content if present
        if (textContent.isNotEmpty()) {
            sb.append(textContent)
        } else if (childElements.isNotEmpty()) {
            sb.append("\n") // New line for child elements
        }

        // Process child elements
        childElements.forEach { (key, value) ->
            when (value) {
                is Map<*, *> -> {
                    @Suppress("UNCHECKED_CAST")
                    sb.append(mapToXML(value as Map<String, Any>, key, indentLevel + 1))
                }

                is List<*> -> {
                    value.forEach { item ->
                        if (item is Map<*, *>) {
                            @Suppress("UNCHECKED_CAST")
                            sb.append(mapToXML(item as Map<String, Any>, key, indentLevel + 1))
                        }
                    }
                }

                else -> {
                    sb.append("${indent}    <$key>$value</$key>\n")
                }
            }
        }

        // Add closing tag with proper indentation
        if (childElements.isNotEmpty() && textContent.isEmpty()) {
            sb.append(indent)
        }
        sb.append("</$rootElement>\n")
    } else {
        // No root element, process all entries
        data.forEach { (key, value) ->
            when (value) {
                is Map<*, *> -> {
                    if (!key.startsWith("@_") && key != "#text") {
                        @Suppress("UNCHECKED_CAST")
                        sb.append(mapToXML(value as Map<String, Any>, key, indentLevel))
                    }
                }

                is List<*> -> {
                    value.forEach { item ->
                        if (item is Map<*, *>) {
                            @Suppress("UNCHECKED_CAST")
                            sb.append(mapToXML(item as Map<String, Any>, key, indentLevel))
                        }
                    }
                }

                else -> {
                    if (!key.startsWith("@_")) {
                        val indent = "    ".repeat(indentLevel)
                        sb.append("$indent<$key>$value</$key>\n")
                    }
                }
            }
        }
    }

    return sb.toString()
}