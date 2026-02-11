#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UIKS Path Tester - Тестирование связности аудиторий
Анализирует config.js и проверяет достижимость всех аудиторий
"""

import re
import json
import math
from collections import defaultdict, deque
from datetime import datetime
from pathlib import Path


class UIKSPathTester:
    """Тестер путей для системы навигации UIKS"""
    
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.points = {}
        self.corridor_nodes = {}
        self.routing = {
            'maxCorridorDistance': 120,
            'maxRoomToCorridorDistance': 80,
            'axisTolerance': 18,
            'doorAlignTolerance': 16
        }
        self.graph = {}
        
    def parse_config(self):
        """Парсит config.js и извлекает points и corridorNodes"""
        with open(self.config_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Извлекаем points
        self.points = self._extract_section(content, 'points')
        
        # Извлекаем corridorNodes
        self.corridor_nodes = self._extract_section(content, 'corridorNodes')
        
        # Извлекаем routing если есть
        routing_match = re.search(r'routing:\s*\{([^}]+)\}', content)
        if routing_match:
            routing_str = routing_match.group(1)
            for key in self.routing:
                match = re.search(rf'{key}:\s*(\d+)', routing_str)
                if match:
                    self.routing[key] = int(match.group(1))
        
        print(f"✅ Загружено этажей: {len(self.points)}")
        for floor, items in self.points.items():
            print(f"   Этаж {floor}: {len(items)} точек (комнаты/лестницы/туалеты)")
        for floor, items in self.corridor_nodes.items():
            doors = len([x for x in items if x.get('type') == 'door'])
            corridors = len([x for x in items if x.get('type') == 'corridor'])
            print(f"   Этаж {floor}: {doors} дверей, {corridors} точек коридора")
    
    def _extract_section(self, content: str, section_name: str) -> dict:
        """Извлекает секцию (points или corridorNodes) из JS-кода"""
        result = {}
        
        # Ищем начало секции
        pattern = rf'{section_name}:\s*\{{'
        match = re.search(pattern, content)
        if not match:
            print(f"⚠️ Секция {section_name} не найдена")
            return result
        
        start_pos = match.end()
        
        # Ищем все этажи внутри секции
        floor_pattern = r'(\d+):\s*\['
        
        # Находим позицию конца секции (следующее свойство на том же уровне или конец объекта)
        brace_count = 1
        pos = start_pos
        section_end = len(content)
        
        while pos < len(content) and brace_count > 0:
            if content[pos] == '{':
                brace_count += 1
            elif content[pos] == '}':
                brace_count -= 1
            pos += 1
        section_end = pos
        
        section_content = content[start_pos:section_end]
        
        # Извлекаем каждый этаж
        for floor_match in re.finditer(floor_pattern, section_content):
            floor_num = floor_match.group(1)
            array_start = floor_match.end()
            
            # Находим конец массива
            bracket_count = 1
            pos = array_start
            while pos < len(section_content) and bracket_count > 0:
                if section_content[pos] == '[':
                    bracket_count += 1
                elif section_content[pos] == ']':
                    bracket_count -= 1
                pos += 1
            
            array_content = section_content[array_start:pos-1]
            
            # Парсим объекты внутри массива
            items = self._parse_array_items(array_content)
            result[int(floor_num)] = items
        
        return result
    
    def _parse_array_items(self, array_content: str) -> list:
        """Парсит элементы массива из JS-кода"""
        items = []
        
        # Паттерн для объекта
        obj_pattern = r'\{\s*([^}]+)\s*\}'
        
        for obj_match in re.finditer(obj_pattern, array_content):
            obj_str = obj_match.group(1)
            item = {}
            
            # Извлекаем id
            id_match = re.search(r'id:\s*["\']([^"\']+)["\']', obj_str)
            if id_match:
                item['id'] = id_match.group(1)
            
            # Извлекаем name
            name_match = re.search(r'name:\s*["\']([^"\']+)["\']', obj_str)
            if name_match:
                item['name'] = name_match.group(1)
            
            # Извлекаем type
            type_match = re.search(r'type:\s*["\']([^"\']+)["\']', obj_str)
            if type_match:
                item['type'] = type_match.group(1)
            
            # Извлекаем room (для дверей)
            room_match = re.search(r'room:\s*["\']([^"\']+)["\']', obj_str)
            if room_match:
                item['room'] = room_match.group(1)
            
            # Извлекаем coords
            coords_match = re.search(r'coords:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]', obj_str)
            if coords_match:
                item['coords'] = [int(coords_match.group(1)), int(coords_match.group(2))]
            
            if 'id' in item and 'coords' in item:
                items.append(item)
        
        return items
    
    @staticmethod
    def dist(a: list, b: list) -> float:
        """Вычисляет расстояние между двумя точками"""
        return math.hypot(a[0] - b[0], a[1] - b[1])
    
    def build_graph(self):
        """Строит граф связей (аналог buildGraph из JS)"""
        self.graph = {}
        
        max_corridor_dist = self.routing['maxCorridorDistance']
        max_room_to_corridor = self.routing['maxRoomToCorridorDistance']
        axis_tolerance = self.routing['axisTolerance']
        door_align_tolerance = self.routing['doorAlignTolerance']
        
        # 1) Регистрируем комнаты/лестницы/туалеты
        for floor, items in self.points.items():
            for p in items:
                node_id = f"{p['id']}_{floor}"
                self.graph[node_id] = {
                    'id': p['id'],
                    'floor': floor,
                    'type': p.get('type', 'room'),
                    'coords': p['coords'],
                    'neighbors': []
                }
        
        # 2) Регистрируем corridorNodes (door + corridor)
        for floor, items in self.corridor_nodes.items():
            for n in items:
                node_id = f"{n['id']}_{floor}"
                self.graph[node_id] = {
                    'id': n['id'],
                    'floor': floor,
                    'type': n.get('type', 'corridor'),
                    'room': n.get('room'),
                    'coords': n['coords'],
                    'neighbors': []
                }
        
        # 3) Комната → Дверь
        for floor, items in self.points.items():
            doors = [n for n in self.corridor_nodes.get(floor, []) if n.get('type') == 'door']
            
            for room in items:
                room_id = f"{room['id']}_{floor}"
                for door in doors:
                    if door.get('room') == room['id']:
                        door_id = f"{door['id']}_{floor}"
                        distance = self.dist(room['coords'], door['coords'])
                        self._add_edge(room_id, door_id, distance)
        
        # 4) Дверь → Коридор
        for floor, items in self.corridor_nodes.items():
            doors = [n for n in items if n.get('type') == 'door']
            corridors = [n for n in items if n.get('type') == 'corridor']
            
            for door in doors:
                door_id = f"{door['id']}_{floor}"
                
                # Ищем выровненные точки коридора
                aligned = []
                for c in corridors:
                    d = self.dist(door['coords'], c['coords'])
                    dx = abs(door['coords'][1] - c['coords'][1])
                    dy = abs(door['coords'][0] - c['coords'][0])
                    is_aligned = dx <= door_align_tolerance or dy <= door_align_tolerance
                    
                    if d <= max_room_to_corridor and is_aligned:
                        aligned.append((c, d))
                
                # Берём 2 ближайших
                aligned.sort(key=lambda x: x[1])
                for c, d in aligned[:2]:
                    corridor_id = f"{c['id']}_{floor}"
                    self._add_edge(door_id, corridor_id, d)
        
        # 5) Коридор → Коридор
        for floor, items in self.corridor_nodes.items():
            corridors = [n for n in items if n.get('type') == 'corridor']
            
            # Группируем по горизонтали (одинаковый Y)
            groups_h = defaultdict(list)
            for c in corridors:
                y = c['coords'][0]
                # Ищем существующую группу
                found_group = None
                for group_y in groups_h:
                    if abs(group_y - y) <= axis_tolerance:
                        found_group = group_y
                        break
                if found_group is not None:
                    groups_h[found_group].append(c)
                else:
                    groups_h[y].append(c)
            
            for y, group in groups_h.items():
                group.sort(key=lambda c: c['coords'][1])
                for i in range(len(group) - 1):
                    a, b = group[i], group[i + 1]
                    d = self.dist(a['coords'], b['coords'])
                    if d <= max_corridor_dist:
                        self._add_edge(f"{a['id']}_{floor}", f"{b['id']}_{floor}", d)
            
            # Группируем по вертикали (одинаковый X)
            groups_v = defaultdict(list)
            for c in corridors:
                x = c['coords'][1]
                found_group = None
                for group_x in groups_v:
                    if abs(group_x - x) <= axis_tolerance:
                        found_group = group_x
                        break
                if found_group is not None:
                    groups_v[found_group].append(c)
                else:
                    groups_v[x].append(c)
            
            for x, group in groups_v.items():
                group.sort(key=lambda c: c['coords'][0])
                for i in range(len(group) - 1):
                    a, b = group[i], group[i + 1]
                    d = self.dist(a['coords'], b['coords'])
                    if d <= max_corridor_dist:
                        self._add_edge(f"{a['id']}_{floor}", f"{b['id']}_{floor}", d)
        
        # 6) Лестницы между этажами
        floors = sorted(self.points.keys())
        for i in range(len(floors) - 1):
            f1, f2 = floors[i], floors[i + 1]
            stairs1 = [p for p in self.points[f1] if p.get('type') == 'stair']
            stairs2 = [p for p in self.points[f2] if p.get('type') == 'stair']
            
            for s1 in stairs1:
                for s2 in stairs2:
                    if s1['id'] == s2['id']:
                        self._add_edge(f"{s1['id']}_{f1}", f"{s2['id']}_{f2}", 10)
        
        print(f"✅ Граф построен: {len(self.graph)} узлов")
    
    def _add_edge(self, a_id: str, b_id: str, distance: float):
        """Добавляет ребро между двумя узлами"""
        if a_id not in self.graph or b_id not in self.graph:
            return
        
        # Добавляем связь A → B
        if not any(n['id'] == b_id for n in self.graph[a_id]['neighbors']):
            self.graph[a_id]['neighbors'].append({'id': b_id, 'distance': distance})
        
        # Добавляем связь B → A
        if not any(n['id'] == a_id for n in self.graph[b_id]['neighbors']):
            self.graph[b_id]['neighbors'].append({'id': a_id, 'distance': distance})
    
    def find_path(self, from_id: str, to_id: str) -> dict:
        """Ищет путь между двумя точками (BFS)"""
        # Находим узлы по id
        start_keys = [k for k, v in self.graph.items() if v['id'] == from_id]
        end_keys = [k for k, v in self.graph.items() if v['id'] == to_id]
        
        if not start_keys:
            return {'path': None, 'error': f'Точка "{from_id}" не найдена в графе'}
        if not end_keys:
            return {'path': None, 'error': f'Точка "{to_id}" не найдена в графе'}
        
        # BFS от первого найденного стартового узла
        start_node = start_keys[0]
        queue = deque([start_node])
        visited = set()
        parent = {}
        
        while queue:
            current = queue.popleft()
            if current in visited:
                continue
            visited.add(current)
            
            node = self.graph.get(current)
            if not node:
                continue
            
            # Проверяем, достигли ли цели
            if node['id'] == to_id:
                # Восстанавливаем путь
                path = []
                u = current
                while u:
                    path.insert(0, u)
                    u = parent.get(u)
                
                # Вычисляем расстояние
                distance = 0
                for i in range(len(path) - 1):
                    node_a = self.graph[path[i]]
                    node_b = self.graph[path[i + 1]]
                    distance += self.dist(node_a['coords'], node_b['coords'])
                
                return {'path': path, 'distance': distance}
            
            # Добавляем соседей в очередь
            for neighbor in node['neighbors']:
                n_id = neighbor['id']
                if n_id not in visited and n_id not in parent:
                    parent[n_id] = current
                    queue.append(n_id)
        
        return {'path': None, 'error': 'Маршрут не найден'}
    
    def get_all_rooms(self) -> list:
        """Возвращает список всех комнат (аудиторий)"""
        rooms = []
        for floor, items in self.points.items():
            for p in items:
                if p.get('type') in ['room', 'stair', 'toilet']:
                    rooms.append({
                        'id': p['id'],
                        'floor': floor,
                        'type': p.get('type', 'room'),
                        'full_id': f"{p['id']}_{floor}"
                    })
        return rooms
    
    def test_all_paths(self) -> dict:
        """Тестирует все возможные пути между аудиториями"""
        rooms = self.get_all_rooms()
        total = len(rooms) * len(rooms)
        
        print(f"\n🔍 Тестирование всех путей...")
        print(f"   Всего аудиторий: {len(rooms)}")
        print(f"   Всего проверок: {total}")
        
        results = {
            'green': [],   # Путь найден
            'yellow': [],  # Нет пути (обе точки в графе)
            'red': [],     # Ошибка (точка не найдена)
            'stats': {
                'total': total,
                'success': 0,
                'no_path': 0,
                'error': 0
            }
        }
        
        checked = 0
        for i, room_from in enumerate(rooms):
            for room_to in rooms:
                if room_from['id'] == room_to['id'] and room_from['floor'] == room_to['floor']:
                    # Пропускаем путь к самому себе
                    results['stats']['success'] += 1
                    continue
                
                result = self.find_path(room_from['id'], room_to['id'])
                
                pair_info = {
                    'from': room_from['id'],
                    'from_floor': room_from['floor'],
                    'to': room_to['id'],
                    'to_floor': room_to['floor']
                }
                
                if result['path']:
                    results['green'].append({
                        **pair_info,
                        'distance': result['distance'],
                        'path_length': len(result['path'])
                    })
                    results['stats']['success'] += 1
                elif 'не найдена' in result.get('error', ''):
                    results['red'].append({
                        **pair_info,
                        'error': result['error']
                    })
                    results['stats']['error'] += 1
                else:
                    results['yellow'].append({
                        **pair_info,
                        'error': result.get('error', 'Неизвестная ошибка')
                    })
                    results['stats']['no_path'] += 1
                
                checked += 1
                if checked % 5000 == 0:
                    print(f"   Проверено: {checked}/{total} ({100*checked//total}%)")
        
        print(f"\n✅ Тестирование завершено!")
        print(f"   🟢 Успешных путей: {results['stats']['success']}")
        print(f"   🟡 Нет пути: {results['stats']['no_path']}")
        print(f"   🔴 Ошибок: {results['stats']['error']}")
        
        return results
    
    def analyze_connectivity(self) -> dict:
        """Анализирует связность графа (компоненты связности)"""
        print(f"\n🔍 Анализ связности графа...")
        
        visited = set()
        components = []
        
        for start_node in self.graph:
            if start_node in visited:
                continue
            
            # BFS для поиска компоненты связности
            component = []
            queue = deque([start_node])
            
            while queue:
                current = queue.popleft()
                if current in visited:
                    continue
                visited.add(current)
                component.append(current)
                
                node = self.graph.get(current)
                if node:
                    for neighbor in node['neighbors']:
                        if neighbor['id'] not in visited:
                            queue.append(neighbor['id'])
            
            components.append(component)
        
        # Анализируем компоненты
        print(f"   Найдено компонент связности: {len(components)}")
        
        # Группируем по этажам
        floor_analysis = defaultdict(lambda: {'components': [], 'isolated': []})
        
        for i, component in enumerate(components):
            floors_in_component = set()
            rooms_in_component = []
            
            for node_id in component:
                node = self.graph[node_id]
                floors_in_component.add(node['floor'])
                if node['type'] in ['room', 'stair', 'toilet']:
                    rooms_in_component.append({
                        'id': node['id'],
                        'floor': node['floor'],
                        'type': node['type']
                    })
            
            for floor in floors_in_component:
                floor_rooms = [r for r in rooms_in_component if r['floor'] == floor]
                floor_analysis[floor]['components'].append({
                    'index': i,
                    'size': len(floor_rooms),
                    'rooms': floor_rooms,
                    'is_main': len(component) > 10
                })
        
        return {
            'total_components': len(components),
            'is_fully_connected': len(components) == 1,
            'floor_analysis': dict(floor_analysis),
            'components': [
                {
                    'index': i,
                    'size': len(c),
                    'nodes': c[:10] if len(c) > 10 else c,  # Первые 10 для примера
                    'truncated': len(c) > 10
                }
                for i, c in enumerate(components)
            ]
        }
    
    def find_isolated_rooms(self) -> list:
        """Находит комнаты без связи с коридором"""
        isolated = []
        
        for floor, items in self.points.items():
            for room in items:
                if room.get('type') not in ['room', 'stair', 'toilet']:
                    continue
                
                room_node_id = f"{room['id']}_{floor}"
                node = self.graph.get(room_node_id)
                
                if not node:
                    isolated.append({
                        'id': room['id'],
                        'floor': floor,
                        'type': room.get('type'),
                        'reason': 'Узел не найден в графе'
                    })
                elif not node['neighbors']:
                    isolated.append({
                        'id': room['id'],
                        'floor': floor,
                        'type': room.get('type'),
                        'reason': 'Нет связей (соседей)'
                    })
                else:
                    # Проверяем, есть ли связь с дверью
                    has_door = any(
                        'Door_' in n['id'] or self.graph.get(n['id'], {}).get('type') == 'door'
                        for n in node['neighbors']
                    )
                    if not has_door and room.get('type') == 'room':
                        isolated.append({
                            'id': room['id'],
                            'floor': floor,
                            'type': room.get('type'),
                            'reason': 'Нет связи с дверью'
                        })
        
        return isolated
    
    def generate_html_report(self, results: dict, connectivity: dict, output_path: str):
        """Генерирует HTML-отчёт"""
        
        isolated = self.find_isolated_rooms()
        
        html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UIKS Path Tester - Отчёт</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a2e; 
            color: #eee;
            padding: 20px;
            line-height: 1.6;
        }}
        .container {{ max-width: 1400px; margin: 0 auto; }}
        h1 {{ 
            text-align: center; 
            margin-bottom: 30px;
            color: #00d9ff;
            font-size: 2.5em;
        }}
        h2 {{ 
            color: #00d9ff; 
            margin: 30px 0 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #00d9ff33;
        }}
        h3 {{ color: #ff6b6b; margin: 20px 0 10px; }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .stat-card {{
            background: #16213e;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid #0f3460;
        }}
        .stat-card.green {{ border-color: #00ff88; }}
        .stat-card.yellow {{ border-color: #ffdd00; }}
        .stat-card.red {{ border-color: #ff4757; }}
        .stat-card.blue {{ border-color: #00d9ff; }}
        
        .stat-number {{
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }}
        .stat-card.green .stat-number {{ color: #00ff88; }}
        .stat-card.yellow .stat-number {{ color: #ffdd00; }}
        .stat-card.red .stat-number {{ color: #ff4757; }}
        .stat-card.blue .stat-number {{ color: #00d9ff; }}
        
        .stat-label {{ color: #aaa; font-size: 0.9em; }}
        
        .status {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }}
        .status.success {{ background: #00ff8833; color: #00ff88; }}
        .status.warning {{ background: #ffdd0033; color: #ffdd00; }}
        .status.error {{ background: #ff475733; color: #ff4757; }}
        
        .floor-section {{
            background: #16213e;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }}
        .floor-title {{
            font-size: 1.3em;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .floor-title .emoji {{ font-size: 1.5em; }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #0f3460;
        }}
        th {{ 
            background: #0f3460; 
            color: #00d9ff;
            font-weight: 600;
        }}
        tr:hover {{ background: #0f346033; }}
        
        .problem-list {{
            background: #1a1a2e;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }}
        .problem-item {{
            padding: 10px;
            margin: 5px 0;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .problem-item.red {{ background: #ff475722; border-left: 4px solid #ff4757; }}
        .problem-item.yellow {{ background: #ffdd0022; border-left: 4px solid #ffdd00; }}
        
        .timestamp {{
            text-align: center;
            color: #666;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #333;
        }}
        
        .collapsible {{
            cursor: pointer;
            padding: 15px;
            background: #0f3460;
            border-radius: 8px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .collapsible:hover {{ background: #16213e; }}
        .collapsible::after {{ content: '▼'; transition: transform 0.3s; }}
        .collapsible.active::after {{ transform: rotate(180deg); }}
        .content {{
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
            background: #16213e;
            border-radius: 0 0 8px 8px;
        }}
        .content.show {{ max-height: 2000px; }}
        .content-inner {{ padding: 15px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🏢 UIKS Path Tester</h1>
        
        <h2>📊 Общая статистика</h2>
        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-number">{results['stats']['total']}</div>
                <div class="stat-label">Всего проверок</div>
            </div>
            <div class="stat-card green">
                <div class="stat-number">{results['stats']['success']}</div>
                <div class="stat-label">Успешных путей</div>
            </div>
            <div class="stat-card yellow">
                <div class="stat-number">{results['stats']['no_path']}</div>
                <div class="stat-label">Нет пути</div>
            </div>
            <div class="stat-card red">
                <div class="stat-number">{results['stats']['error']}</div>
                <div class="stat-label">Ошибок</div>
            </div>
        </div>
        
        <h2>🔗 Связность графа</h2>
        <div class="floor-section">
            <div class="floor-title">
                {"<span class='emoji'>✅</span> Граф полностью связан" if connectivity['is_fully_connected'] else f"<span class='emoji'>⚠️</span> Найдено {connectivity['total_components']} компонент связности"}
            </div>
            <p>{"Все аудитории достижимы друг из друга (включая межэтажные переходы через лестницы)." if connectivity['is_fully_connected'] else "Некоторые группы аудиторий изолированы друг от друга."}</p>
        </div>
"""
        
        # Анализ по этажам
        html += """
        <h2>🏗️ Анализ по этажам</h2>
"""
        for floor in sorted(self.points.keys()):
            floor_data = connectivity['floor_analysis'].get(floor, {'components': []})
            total_rooms = len([p for p in self.points[floor] if p.get('type') in ['room', 'stair', 'toilet']])
            floor_isolated = [r for r in isolated if r['floor'] == floor]
            
            status_class = 'success' if not floor_isolated else 'warning' if len(floor_isolated) < 5 else 'error'
            status_text = 'Все связано' if not floor_isolated else f'{len(floor_isolated)} проблем'
            
            html += f"""
        <div class="floor-section">
            <div class="floor-title">
                <span class="emoji">🏢</span>
                Этаж {floor}
                <span class="status {status_class}">{status_text}</span>
            </div>
            <p>Всего точек: {total_rooms} (комнаты, лестницы, туалеты)</p>
"""
            if floor_isolated:
                html += """
            <h3>⚠️ Проблемные точки:</h3>
            <div class="problem-list">
"""
                for item in floor_isolated[:20]:  # Показываем первые 20
                    html += f"""
                <div class="problem-item red">
                    <span><strong>{item['id']}</strong> ({item['type']})</span>
                    <span>{item['reason']}</span>
                </div>
"""
                if len(floor_isolated) > 20:
                    html += f"""
                <div class="problem-item yellow">
                    <span>... и ещё {len(floor_isolated) - 20} проблемных точек</span>
                </div>
"""
                html += """
            </div>
"""
            html += """
        </div>
"""
        
        # Проблемные пары (если есть)
        if results['red'] or results['yellow']:
            html += """
        <h2>🚨 Проблемные маршруты</h2>
"""
            if results['red']:
                html += f"""
        <div class="collapsible" onclick="this.classList.toggle('active'); this.nextElementSibling.classList.toggle('show');">
            <span>🔴 Ошибки конфигурации ({len(results['red'])} шт.)</span>
        </div>
        <div class="content">
            <div class="content-inner">
                <table>
                    <tr><th>Откуда</th><th>Этаж</th><th>Куда</th><th>Этаж</th><th>Ошибка</th></tr>
"""
                for item in results['red'][:50]:  # Первые 50
                    html += f"""
                    <tr>
                        <td>{item['from']}</td>
                        <td>{item['from_floor']}</td>
                        <td>{item['to']}</td>
                        <td>{item['to_floor']}</td>
                        <td>{item['error']}</td>
                    </tr>
"""
                html += """
                </table>
            </div>
        </div>
"""
            
            if results['yellow']:
                html += f"""
        <div class="collapsible" onclick="this.classList.toggle('active'); this.nextElementSibling.classList.toggle('show');">
            <span>🟡 Недостижимые пары ({len(results['yellow'])} шт.)</span>
        </div>
        <div class="content">
            <div class="content-inner">
                <table>
                    <tr><th>Откуда</th><th>Этаж</th><th>Куда</th><th>Этаж</th><th>Причина</th></tr>
"""
                for item in results['yellow'][:50]:
                    html += f"""
                    <tr>
                        <td>{item['from']}</td>
                        <td>{item['from_floor']}</td>
                        <td>{item['to']}</td>
                        <td>{item['to_floor']}</td>
                        <td>{item.get('error', 'Нет пути')}</td>
                    </tr>
"""
                html += """
                </table>
            </div>
        </div>
"""
        
        html += f"""
        <div class="timestamp">
            Отчёт сгенерирован: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        </div>
    </div>
</body>
</html>
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"\n📄 HTML-отчёт сохранён: {output_path}")
    
    def generate_json_report(self, results: dict, connectivity: dict, output_path: str):
        """Генерирует JSON-отчёт для программной обработки"""
        report = {
            'generated_at': datetime.now().isoformat(),
            'stats': results['stats'],
            'connectivity': {
                'is_fully_connected': connectivity['is_fully_connected'],
                'total_components': connectivity['total_components']
            },
            'isolated_rooms': self.find_isolated_rooms(),
            'problems': {
                'errors': results['red'][:100],  # Первые 100
                'no_path': results['yellow'][:100]
            }
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"📄 JSON-отчёт сохранён: {output_path}")


def main():
    """Главная функция"""
    print("=" * 60)
    print("🏢 UIKS Path Tester")
    print("=" * 60)
    
    # Путь к config.js (измени при необходимости)
    config_path = "js/config.js"
    
    # Проверяем существование файла
    if not Path(config_path).exists():
        print(f"❌ Файл не найден: {config_path}")
        print("   Укажи правильный путь к config.js")
        config_path = input("Введи путь к config.js: ").strip()
        if not Path(config_path).exists():
            print("❌ Файл не найден. Выход.")
            return
    
    # Создаём тестер
    tester = UIKSPathTester(config_path)
    
    # Парсим конфиг
    print("\n📖 Загрузка config.js...")
    tester.parse_config()
    
    # Строим граф
    print("\n🔨 Построение графа...")
    tester.build_graph()
    
    # Анализ связности (быстрый)
    connectivity = tester.analyze_connectivity()
    
    # Полное тестирование всех путей
    print("\n" + "=" * 60)
    results = tester.test_all_paths()
    
    # Генерируем отчёты
    print("\n📝 Генерация отчётов...")
    tester.generate_html_report(results, connectivity, "uiks_report.html")
    tester.generate_json_report(results, connectivity, "uiks_report.json")
    
    print("\n" + "=" * 60)
    print("✅ Готово!")
    print("   Открой uiks_report.html в браузере для просмотра результатов")


if __name__ == "__main__":
    main()