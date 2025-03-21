const CHUNK_SIZE = 16 * 1024; // 16KB chunks

function chunkFile(file) {
  let chunks = [];
  for (let i = 0; i < file.size; i += CHUNK_SIZE) {
    let chunk = file.slice(i, i + CHUNK_SIZE);
    chunks.push(chunk);
  }
  return chunks;
}

module.exports = { chunkFile };
