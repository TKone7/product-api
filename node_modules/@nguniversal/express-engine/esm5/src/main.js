/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import { NgModuleFactory, CompilerFactory } from '@angular/core';
import { ResourceLoader } from '@angular/compiler';
import { INITIAL_CONFIG, renderModuleFactory, platformDynamicServer } from '@angular/platform-server';
import { FileLoader } from './file-loader';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
/**
 * This holds a cached version of each index used.
 */
var templateCache = {};
/**
 * Map of Module Factories
 */
var factoryCacheMap = new Map();
/**
 * This is an express engine for handling Angular Applications
 */
export function ngExpressEngine(setupOptions) {
    var compilerFactory = platformDynamicServer().injector.get(CompilerFactory);
    var compiler = compilerFactory.createCompiler([
        {
            providers: [
                { provide: ResourceLoader, useClass: FileLoader, deps: [] }
            ]
        }
    ]);
    return function (filePath, options, callback) {
        options.providers = options.providers || [];
        try {
            var moduleOrFactory = options.bootstrap || setupOptions.bootstrap;
            if (!moduleOrFactory) {
                throw new Error('You must pass in a NgModule or NgModuleFactory to be bootstrapped');
            }
            setupOptions.providers = setupOptions.providers || [];
            var req = options.req;
            var extraProviders_1 = setupOptions.providers.concat(options.providers, getReqResProviders(options.req, options.res), [
                {
                    provide: INITIAL_CONFIG,
                    useValue: {
                        document: options.document || getDocument(filePath),
                        url: options.url || req.protocol + "://" + (req.get('host') || '') + req.originalUrl
                    }
                }
            ]);
            getFactory(moduleOrFactory, compiler)
                .then(function (factory) {
                return renderModuleFactory(factory, {
                    extraProviders: extraProviders_1
                });
            })
                .then(function (html) {
                callback(null, html);
            }, function (err) {
                callback(err);
            });
        }
        catch (err) {
            callback(err);
        }
    };
}
/**
 * Get a factory from a bootstrapped module/ module factory
 */
function getFactory(moduleOrFactory, compiler) {
    return new Promise(function (resolve, reject) {
        // If module has been compiled AoT
        if (moduleOrFactory instanceof NgModuleFactory) {
            resolve(moduleOrFactory);
            return;
        }
        else {
            var moduleFactory = factoryCacheMap.get(moduleOrFactory);
            // If module factory is cached
            if (moduleFactory) {
                resolve(moduleFactory);
                return;
            }
            // Compile the module and cache it
            compiler.compileModuleAsync(moduleOrFactory)
                .then(function (factory) {
                factoryCacheMap.set(moduleOrFactory, factory);
                resolve(factory);
            }, (function (err) {
                reject(err);
            }));
        }
    });
}
/**
 * Get providers of the request and response
 */
function getReqResProviders(req, res) {
    var providers = [
        {
            provide: REQUEST,
            useValue: req
        }
    ];
    if (res) {
        providers.push({
            provide: RESPONSE,
            useValue: res
        });
    }
    return providers;
}
/**
 * Get the document at the file path
 */
function getDocument(filePath) {
    return templateCache[filePath] = templateCache[filePath] || fs.readFileSync(filePath).toString();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvZXhwcmVzcy1lbmdpbmUvc3JjL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFHekIsT0FBTyxFQUFFLGVBQWUsRUFBUSxlQUFlLEVBQTRCLE1BQU0sZUFBZSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsY0FBYyxFQUNkLG1CQUFtQixFQUNuQixxQkFBcUIsRUFDdEIsTUFBTSwwQkFBMEIsQ0FBQztBQUVsQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFvQnZFOztHQUVHO0FBQ0gsSUFBTSxhQUFhLEdBQThCLEVBQUUsQ0FBQztBQUVwRDs7R0FFRztBQUNILElBQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO0FBRWpFOztHQUVHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxZQUE0QjtJQUUxRCxJQUFNLGVBQWUsR0FBb0IscUJBQXFCLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQy9GLElBQU0sUUFBUSxHQUFhLGVBQWUsQ0FBQyxjQUFjLENBQUM7UUFDeEQ7WUFDRSxTQUFTLEVBQUU7Z0JBQ1QsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTthQUM1RDtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTyxVQUFVLFFBQWdCLEVBQ2hCLE9BQXNCLEVBQ3RCLFFBQXFEO1FBRXBFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FB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LFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDYixPQUFPLEVBQUUsUUFBUTtZQUNqQixRQUFRLEVBQUUsR0FBRztTQUNkLENBQUMsQ0FBQztLQUNKO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxXQUFXLENBQUMsUUFBZ0I7SUFDbkMsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbkcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcblxuaW1wb3J0IHsgTmdNb2R1bGVGYWN0b3J5LCBUeXBlLCBDb21waWxlckZhY3RvcnksIENvbXBpbGVyLCBTdGF0aWNQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmVzb3VyY2VMb2FkZXIgfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge1xuICBJTklUSUFMX0NPTkZJRyxcbiAgcmVuZGVyTW9kdWxlRmFjdG9yeSxcbiAgcGxhdGZvcm1EeW5hbWljU2VydmVyXG59IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLXNlcnZlcic7XG5cbmltcG9ydCB7IEZpbGVMb2FkZXIgfSBmcm9tICcuL2ZpbGUtbG9hZGVyJztcbmltcG9ydCB7IFJFUVVFU1QsIFJFU1BPTlNFIH0gZnJvbSAnQG5ndW5pdmVyc2FsL2V4cHJlc3MtZW5naW5lL3Rva2Vucyc7XG5cbi8qKlxuICogVGhlc2UgYXJlIHRoZSBhbGxvd2VkIG9wdGlvbnMgZm9yIHRoZSBlbmdpbmVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ1NldHVwT3B0aW9ucyB7XG4gIGJvb3RzdHJhcDogVHlwZTx7fT4gfCBOZ01vZHVsZUZhY3Rvcnk8e30+O1xuICBwcm92aWRlcnM/OiBTdGF0aWNQcm92aWRlcltdO1xufVxuXG4vKipcbiAqIFRoZXNlIGFyZSB0aGUgYWxsb3dlZCBvcHRpb25zIGZvciB0aGUgcmVuZGVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyT3B0aW9ucyBleHRlbmRzIE5nU2V0dXBPcHRpb25zIHtcbiAgcmVxOiBSZXF1ZXN0O1xuICByZXM/OiBSZXNwb25zZTtcbiAgdXJsPzogc3RyaW5nO1xuICBkb2N1bWVudD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBUaGlzIGhvbGRzIGEgY2FjaGVkIHZlcnNpb24gb2YgZWFjaCBpbmRleCB1c2VkLlxuICovXG5jb25zdCB0ZW1wbGF0ZUNhY2hlOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG5cbi8qKlxuICogTWFwIG9mIE1vZHVsZSBGYWN0b3JpZXNcbiAqL1xuY29uc3QgZmFjdG9yeUNhY2hlTWFwID0gbmV3IE1hcDxUeXBlPHt9PiwgTmdNb2R1bGVGYWN0b3J5PHt9Pj4oKTtcblxuLyoqXG4gKiBUaGlzIGlzIGFuIGV4cHJlc3MgZW5naW5lIGZvciBoYW5kbGluZyBBbmd1bGFyIEFwcGxpY2F0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbmdFeHByZXNzRW5naW5lKHNldHVwT3B0aW9uczogTmdTZXR1cE9wdGlvbnMpIHtcblxuICBjb25zdCBjb21waWxlckZhY3Rvcnk6IENvbXBpbGVyRmFjdG9yeSA9IHBsYXRmb3JtRHluYW1pY1NlcnZlcigpLmluamVjdG9yLmdldChDb21waWxlckZhY3RvcnkpO1xuICBjb25zdCBjb21waWxlcjogQ29tcGlsZXIgPSBjb21waWxlckZhY3RvcnkuY3JlYXRlQ29tcGlsZXIoW1xuICAgIHtcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7IHByb3ZpZGU6IFJlc291cmNlTG9hZGVyLCB1c2VDbGFzczogRmlsZUxvYWRlciwgZGVwczogW10gfVxuICAgICAgXVxuICAgIH1cbiAgXSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChmaWxlUGF0aDogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IChlcnI/OiBFcnJvciB8IG51bGwsIGh0bWw/OiBzdHJpbmcpID0+IHZvaWQpIHtcblxuICAgIG9wdGlvbnMucHJvdmlkZXJzID0gb3B0aW9ucy5wcm92aWRlcnMgfHwgW107XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbW9kdWxlT3JGYWN0b3J5ID0gb3B0aW9ucy5ib290c3RyYXAgfHwgc2V0dXBPcHRpb25zLmJvb3RzdHJhcDtcblxuICAgICAgaWYgKCFtb2R1bGVPckZhY3RvcnkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBwYXNzIGluIGEgTmdNb2R1bGUgb3IgTmdNb2R1bGVGYWN0b3J5IHRvIGJlIGJvb3RzdHJhcHBlZCcpO1xuICAgICAgfVxuXG4gICAgICBzZXR1cE9wdGlvbnMucHJvdmlkZXJzID0gc2V0dXBPcHRpb25zLnByb3ZpZGVycyB8fCBbXTtcblxuICAgICAgY29uc3QgcmVxID0gb3B0aW9ucy5yZXE7XG4gICAgICBjb25zdCBleHRyYVByb3ZpZGVycyA9IHNldHVwT3B0aW9ucy5wcm92aWRlcnMuY29uY2F0KFxuICAgICAgICBvcHRpb25zLnByb3ZpZGVycyxcbiAgICAgICAgZ2V0UmVxUmVzUHJvdmlkZXJzKG9wdGlvbnMucmVxLCBvcHRpb25zLnJlcyksXG4gICAgICAgIFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBwcm92aWRlOiBJTklUSUFMX0NPTkZJRyxcbiAgICAgICAgICAgIHVzZVZhbHVlOiB7XG4gICAgICAgICAgICAgIGRvY3VtZW50OiBvcHRpb25zLmRvY3VtZW50IHx8IGdldERvY3VtZW50KGZpbGVQYXRoKSxcbiAgICAgICAgICAgICAgdXJsOiBvcHRpb25zLnVybCB8fCBgJHtyZXEucHJvdG9jb2x9Oi8vJHsocmVxLmdldCgnaG9zdCcpIHx8ICcnKX0ke3JlcS5vcmlnaW5hbFVybH1gXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdKTtcblxuICAgICAgZ2V0RmFjdG9yeShtb2R1bGVPckZhY3RvcnksIGNvbXBpbGVyKVxuICAgICAgICAudGhlbihmYWN0b3J5ID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVuZGVyTW9kdWxlRmFjdG9yeShmYWN0b3J5LCB7XG4gICAgICAgICAgICBleHRyYVByb3ZpZGVyc1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoaHRtbDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgaHRtbCk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIEdldCBhIGZhY3RvcnkgZnJvbSBhIGJvb3RzdHJhcHBlZCBtb2R1bGUvIG1vZHVsZSBmYWN0b3J5XG4gKi9cbmZ1bmN0aW9uIGdldEZhY3RvcnkoXG4gIG1vZHVsZU9yRmFjdG9yeTogVHlwZTx7fT4gfCBOZ01vZHVsZUZhY3Rvcnk8e30+LCBjb21waWxlcjogQ29tcGlsZXJcbik6IFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PHt9Pj4ge1xuICByZXR1cm4gbmV3IFByb21pc2U8TmdNb2R1bGVGYWN0b3J5PHt9Pj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIElmIG1vZHVsZSBoYXMgYmVlbiBjb21waWxlZCBBb1RcbiAgICBpZiAobW9kdWxlT3JGYWN0b3J5IGluc3RhbmNlb2YgTmdNb2R1bGVGYWN0b3J5KSB7XG4gICAgICByZXNvbHZlKG1vZHVsZU9yRmFjdG9yeSk7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtb2R1bGVGYWN0b3J5ID0gZmFjdG9yeUNhY2hlTWFwLmdldChtb2R1bGVPckZhY3RvcnkpO1xuXG4gICAgICAvLyBJZiBtb2R1bGUgZmFjdG9yeSBpcyBjYWNoZWRcbiAgICAgIGlmIChtb2R1bGVGYWN0b3J5KSB7XG4gICAgICAgIHJlc29sdmUobW9kdWxlRmFjdG9yeSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQ29tcGlsZSB0aGUgbW9kdWxlIGFuZCBjYWNoZSBpdFxuICAgICAgY29tcGlsZXIuY29tcGlsZU1vZHVsZUFzeW5jKG1vZHVsZU9yRmFjdG9yeSlcbiAgICAgICAgLnRoZW4oKGZhY3RvcnkpID0+IHtcbiAgICAgICAgICBmYWN0b3J5Q2FjaGVNYXAuc2V0KG1vZHVsZU9yRmFjdG9yeSwgZmFjdG9yeSk7XG4gICAgICAgICAgcmVzb2x2ZShmYWN0b3J5KTtcbiAgICAgICAgfSwgKGVyciA9PiB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEdldCBwcm92aWRlcnMgb2YgdGhlIHJlcXVlc3QgYW5kIHJlc3BvbnNlXG4gKi9cbmZ1bmN0aW9uIGdldFJlcVJlc1Byb3ZpZGVycyhyZXE6IFJlcXVlc3QsIHJlcz86IFJlc3BvbnNlKTogU3RhdGljUHJvdmlkZXJbXSB7XG4gIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBSRVFVRVNULFxuICAgICAgdXNlVmFsdWU6IHJlcVxuICAgIH1cbiAgXTtcbiAgaWYgKHJlcykge1xuICAgIHByb3ZpZGVycy5wdXNoKHtcbiAgICAgIHByb3ZpZGU6IFJFU1BPTlNFLFxuICAgICAgdXNlVmFsdWU6IHJlc1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBwcm92aWRlcnM7XG59XG5cbi8qKlxuICogR2V0IHRoZSBkb2N1bWVudCBhdCB0aGUgZmlsZSBwYXRoXG4gKi9cbmZ1bmN0aW9uIGdldERvY3VtZW50KGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdGVtcGxhdGVDYWNoZVtmaWxlUGF0aF0gPSB0ZW1wbGF0ZUNhY2hlW2ZpbGVQYXRoXSB8fCBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgpLnRvU3RyaW5nKCk7XG59XG4iXX0=