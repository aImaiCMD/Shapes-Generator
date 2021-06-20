import rfdc from 'rfdc';
import { AbstractShapeNode, ParameterMetaData, Point } from '../types/AbstractNode';
import { toRadians } from '../utils/common';

type CircleParams =
    | 'count'
    | 'center_x'
    | 'center_y'
    | 'radius'
    | 'start'
    | 'ellipse'
    | 'rotate';

const defaultParams: Record<CircleParams, string> = {
    count: '12',
    center_x: '0',
    center_y: '0',
    radius: '5',
    start: '0',
    ellipse: '100',
    rotate: '0'
};

const paramMetaData: Record<CircleParams, ParameterMetaData> = {
    center_x: { name: '中心点', description: '円の中心点' },
    center_y: { name: '中心点', description: '円の中心点' },
    count: { name: '生成数', description: 'いくつの点で生成するか' },
    radius: { name: '半径', description: '中心よりどれだけ離れた位置で円を作るか' },
    start: { name: '開始角', description: '円を始める角度' },
    ellipse: { name: '楕円', description: '楕円の歪みの強さ' },
    rotate: { name: '角度', description: '開始角には影響は与えません' }
};

export class CircleShape extends AbstractShapeNode<CircleParams> {
    public constructor(id: string) {
        super(id, rfdc()(defaultParams), paramMetaData);
    }

    protected updatePointSet(params: Record<CircleParams, number>): void {
        const points: Point[] = [];
        const addPoint = (x: number, y: number) => {
            const id = this.getPointID();
            points.push({ id, x, y });
        };

        for (let theta = params.start; theta < 360 + params.start; theta += 360 / params.count) {
            const x = params.center_x + Math.sin(toRadians(theta)) * params.radius;
            const y = params.center_y + -Math.cos(toRadians(theta)) * params.radius;
            addPoint(x, y);
        }

        this.pointSet = points;
    }
}