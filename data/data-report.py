#!/usr/bin/env python

from __future__ import print_function

import json
from collections import Counter

schools = json.load(open('kibera-combined-schools.geojson'))['features']
props = [s['properties'] for s in schools]
by_source = []
for school in schools:
    school_by_source = school.copy()
    k = list(map(lambda p: p.split(':', 1)[1],
                 filter(lambda p: p.startswith('kenyaopendata:'), school['properties'])))
    o = list(map(lambda p: p.split(':', 1)[1],
                 filter(lambda p: p.startswith('osm:'), school['properties'])))
    school_by_source['properties'] = {}
    if k:
        school_by_source['properties']['kenyaopendata'] = k
    if o:
        school_by_source['properties']['osm'] = o

    by_source.append(school_by_source)


def pretty_count(l, indent=4):
    counted = Counter(l)
    for name, num in reversed(sorted(counted.items(), key=lambda s: 0 if s[0] is None else s[1])):
        print('{}{: 4d} {}'.format(' '*indent, num, name))


print('1. Data Source')
sources = []
for school in by_source:
    if 'osm' in school['properties']:
        if 'kenyaopendata' in school['properties']:
            sources.append('both')
        else:
            sources.append('osm')
    else:
        sources.append('kenyaopendata')
pretty_count(sources)


print('2. Type of Education: OSM')
pretty_count([s.get('osm:education:type') for s in props if any(p.startswith('osm:') for p in s)])
print('   ...split up')
osm_ed_types = []
[osm_ed_types.extend(s.get('osm:education:type', '').split(',') if 'osm:education:type' in s else [None])
                     for s in props if any(p.startswith('osm:') for p in s)]
pretty_count(osm_ed_types)

print('2.1 Type of Education: Kenya Open Data')
pretty_count([s.get('kenyaopendata:Level of Education')
              for s in props if any(p.startswith('kenyaopendata:') for p in s)])


print('3. OSM Constituency')
pretty_count([s.get('osm:is_in:constituency') for s in props if any(p.startswith('osm:') for p in s)])
