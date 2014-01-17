/// Definitions for the collectionFS smart package
///
/// https://atmosphere.meteor.com/package/collectionFS
/// https://github.com/CollectionFS/Meteor-CollectionFS


/// <reference path='meteor.d.ts'/>


declare function CollectionFS<T>(name:string, options?: CollectionFS.CollectionFSOptions);

interface CollectionFS<T> {
  ObjectID(hexString?: any): Object;
  find(selector?: any, options?): Meteor.Cursor<T>;
  findOne(selector?, options?):T;
  insert(doc:T, callback?:Function):string;
  update(selector: any, modifier: any, options?: {multi?: boolean; upsert?: boolean;}, callback?:Function): number;
  upsert(selector: any, modifier: any, options?: {multi?: boolean;}, callback?:Function): {numberAffected?: number; insertedId?: string;}
  remove(selector: any, callback?:Function);
  allow(options:Meteor.AllowDenyOptions): boolean;
  deny(options:Meteor.AllowDenyOptions): boolean;
  fileHandlers(handlers: CollectionFS.FileHandlers): void;
  filter(options: CollectionFS.FilterOptions): void;
  fileIsAllowed(options: any): boolean;
  events(events): void;
  dispatch(...args: string[]): void;

  // Client API
  storeFile(file: File, metadata?: {}): string;
  storeFiles(files: File[], metadata: {}, callback?: (file: File, fileID: string) => void): {}[];
  retrieveBlob(fileId: string, callback: (fileItem: CollectionFS.FileItem) => void);
  acceptDrops(templateName: string, selector: string, metadata?: {}, callback?: (file: File, fileID: string) => void): void;

  // Server API
  storeBuffer(fileName: string, buffer: Buffer, options: CollectionFS.StoreBufferOptions): string;
  retrieveBuffer(fileId: string): Buffer;
}

declare module CollectionFS{
  interface FileHandlers {
    [id: string]: (options: CollectionFS.FileHandlerOptions) => any;
  }

  interface CollectionFSOptions {
    autopublish:boolean;
    maxFileHandlers: number;
  }

  interface FilterOptions {
    allow?: {
      extensions?: string[];
      contentTypes?: string[];
    };
    deny?: {
      extensions?: string[];
      contentTypes?: string[];
    };
    maxSize?: number;
  }

  interface FileItem {
    _id: string;
    countChunks: number;
    length: number;
    file?: any;
    blob?: Buffer;
  }

  interface StoreBufferOptions {
    contentType?: string;
    owner?: string;
    noProgress?: boolean;
    metaData?: {};
    encoding?: string;
  }

  interface FileRecord {
    chunkSize?: number; // Default 256kb ~ 262.144 bytes
    uploadDate?: number;  // Client set date
    handledAt?: number;          // datetime set by Server when handled
    fileHandler?:{};           // fileHandler supplied data if any
    md5?: any;               // Not yet implemented
    complete?: boolean;         // countChunks == numChunks
    currentChunk?: number;         // Used to coordinate clients
    owner?: string;
    countChunks?: number; // Expected number of chunks
    numChunks?: number;             // number of chunks in database
    filename?: string;     // Original filename
    length?: string;     // Issue in Meteor
    contentType?: string;
    encoding?: string;       // Default 'utf-8'
    metadata?: {}
  }

  interface FileHandlerOptions {
    blob: Buffer;              // Type of node.js Buffer()
    fileRecord: FileRecord;
    destination: (extension?:string) => {serverFilename: Destination};
    sumFailes: number;
  }

  interface Destination {
    serverFilename: string;
    fileDate: {
      url: string;
      extension: string;
    }
  }
}

//Copied from node.d.ts since node.d.ts was giving me compile errors for overloading some signatures
interface NodeBuffer {
  [index: number]: number;
  write(string: string, offset?: number, length?: number, encoding?: string): number;
  toString(encoding?: string, start?: number, end?: number): string;
  length: number;
  copy(targetBuffer: NodeBuffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): void;
  slice(start?: number, end?: number): NodeBuffer;
  readUInt8(offset: number, noAsset?: boolean): number;
  readUInt16LE(offset: number, noAssert?: boolean): number;
  readUInt16BE(offset: number, noAssert?: boolean): number;
  readUInt32LE(offset: number, noAssert?: boolean): number;
  readUInt32BE(offset: number, noAssert?: boolean): number;
  readInt8(offset: number, noAssert?: boolean): number;
  readInt16LE(offset: number, noAssert?: boolean): number;
  readInt16BE(offset: number, noAssert?: boolean): number;
  readInt32LE(offset: number, noAssert?: boolean): number;
  readInt32BE(offset: number, noAssert?: boolean): number;
  readFloatLE(offset: number, noAssert?: boolean): number;
  readFloatBE(offset: number, noAssert?: boolean): number;
  readDoubleLE(offset: number, noAssert?: boolean): number;
  readDoubleBE(offset: number, noAssert?: boolean): number;
  writeUInt8(value: number, offset: number, noAssert?: boolean): void;
  writeUInt16LE(value: number, offset: number, noAssert?: boolean): void;
  writeUInt16BE(value: number, offset: number, noAssert?: boolean): void;
  writeUInt32LE(value: number, offset: number, noAssert?: boolean): void;
  writeUInt32BE(value: number, offset: number, noAssert?: boolean): void;
  writeInt8(value: number, offset: number, noAssert?: boolean): void;
  writeInt16LE(value: number, offset: number, noAssert?: boolean): void;
  writeInt16BE(value: number, offset: number, noAssert?: boolean): void;
  writeInt32LE(value: number, offset: number, noAssert?: boolean): void;
  writeInt32BE(value: number, offset: number, noAssert?: boolean): void;
  writeFloatLE(value: number, offset: number, noAssert?: boolean): void;
  writeFloatBE(value: number, offset: number, noAssert?: boolean): void;
  writeDoubleLE(value: number, offset: number, noAssert?: boolean): void;
  writeDoubleBE(value: number, offset: number, noAssert?: boolean): void;
  fill(value: any, offset?: number, end?: number): void;
  INSPECT_MAX_BYTES: number;
}

//Copied from node.d.ts since node.d.ts was giving me compile errors for overloading some signatures
interface Buffer extends NodeBuffer {
  new (str: string, encoding?: string): NodeBuffer;
  new (size: number): NodeBuffer;
  new (array: any[]): NodeBuffer;
  prototype: NodeBuffer;
  isBuffer(obj: any): boolean;
  byteLength(string: string, encoding?: string): number;
  concat    (list: NodeBuffer[], totalLength?: number): NodeBuffer;
}

//Copied from node.d.ts since node.d.ts was giving me compile errors for overloading some signatures
declare var Buffer: (size: number) => Buffer;

