import fi.iki.elonen.NanoHTTPD

fun readUtf8Body(session: NanoHTTPD.IHTTPSession): String {
    val contentLength = session.headers["content-length"]?.toIntOrNull() ?: return ""
    val buffer = ByteArray(contentLength)
    session.inputStream.read(buffer)
    return buffer.toString(Charsets.UTF_8)
}
