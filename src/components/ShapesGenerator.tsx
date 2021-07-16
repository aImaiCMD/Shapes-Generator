import React, { useState, useMemo, useCallback, useReducer, useEffect } from 'react';
import Col from 'react-bootstrap/esm/Col';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import createReducer from '../reducers/shapesReducer'; '../reducers/shapesReducer';
import styles from '../styles/ShapesGenerator.module.scss';
import { GridMode } from '../types/GridMode';
import { deleteDuplicatedPoints } from '../types/Point';
import ContextMenu from './ContextMenu';
import ExportModal from './ExportModal';
import Previewer from './Previewer';
import UserInterface from './UserInterface';

const ShapesGenerator = (): JSX.Element => {
    const [immediatelyAfterExport, setImmediatelyAfterExport] = useState<boolean>(true);
    const [shapes, shapesDispatch] = useReducer(createReducer(() => setImmediatelyAfterExport(false)), []);
    const [gridMode, setGridMode] = useState<GridMode>(GridMode.block);
    const [duplicatedPointRange, setDuplicatedPointRange] = useState<number>(0);
    const [isOpenExportModal, setIsOpenExportModal] = useState<boolean>(false);
    const [contextTarget, setContextTarget] = useState<{ x: number, y: number, index: number } | undefined>();

    const onBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
        if (!immediatelyAfterExport) {
            e.preventDefault();
            e.returnValue = '出力されていないデータが存在します。本当に閉じますか？';
        }
    }, [immediatelyAfterExport]);
    useEffect(() => {
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [onBeforeUnload]);

    const onKeyDown = useCallback(({ key }: { key: string }) => {
        if (contextTarget && key === 'Escape') setContextTarget(undefined);
        if (key === 'Delete') shapesDispatch({ type: 'delete' });
    }, [contextTarget]);

    const onContextCloseRequest = useCallback(() => setContextTarget(undefined), []);

    const dependString = useMemo(() => shapes.map(v => `${v.isSelected ? 1 : 0}${v.pointSet.map(v2 => v2.id).join('+')}`).join('+'), [shapes]);
    const points = useMemo(() => deleteDuplicatedPoints(
        shapes.flatMap(shape => shape.pointSet.map(v => ({ selected: shape.isSelected, point: v }))),
        duplicatedPointRange
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [duplicatedPointRange, dependString]);

    return (
        <div className={styles['shapes-generator']} onKeyDown={onKeyDown}>
            <Container fluid>
                <Row>
                    <Col xl={6} lg={6} md={6} sm={12} xs={12} className={styles['col-previewer']}>
                        <Previewer
                            shapes={points}
                            gridMode={gridMode}
                        />
                    </Col>
                    <Col xl={6} lg={6} md={6} sm={12} xs={12} className={styles['col-user-interface']}>
                        <UserInterface
                            shapes={shapes}
                            shapesDispatch={shapesDispatch}
                            gridMode={gridMode}
                            setGridMode={setGridMode}
                            duplicatedPointRange={duplicatedPointRange}
                            setDuplicatedPointRange={setDuplicatedPointRange}
                            setContextTarget={setContextTarget}
                            openExportModal={setIsOpenExportModal}
                        />
                    </Col>
                </ Row>
            </Container>
            <ExportModal
                points={points.map(v => v.point.pos)}
                isOpen={isOpenExportModal}
                openExportModal={setIsOpenExportModal}
                duplicatedPointRange={duplicatedPointRange}
                setDuplicatedPointRange={setDuplicatedPointRange}
                setImmediatelyAfterExport={setImmediatelyAfterExport}
            />
            <ContextMenu
                x={contextTarget?.x}
                y={contextTarget?.y}
                index={contextTarget?.index}
                onCloseRequest={onContextCloseRequest}
                shapesDispatch={shapesDispatch}
            />
        </div>
    );
};

export default ShapesGenerator;
