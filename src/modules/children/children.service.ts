import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Child } from '../../entities/child.entity';
import {
    CreateChildDto,
    UpdateChildDto,
} from '../../dto/request/children.dto';
import { AgeGroup } from '../../common/enums/age-group.enum';
import { Region } from '../../common/enums/region.enum';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectRepository(Child)
        private childrenRepository: Repository<Child>,
    ) { }

    async create(createChildDto: CreateChildDto): Promise<Child> {
        // Check if child with same name and parent phone already exists
        const existingChild = await this.childrenRepository.findOne({
            where: {
                name: createChildDto.name,
                parentContact: createChildDto.parentContact,
            },
        });

        if (existingChild) {
            throw new ConflictException(
                'Child with this name and parent phone already exists',
            );
        }

        const child = this.childrenRepository.create(createChildDto);
        return this.childrenRepository.save(child);
    }

    async findAll(filters?: {
        ageGroup?: AgeGroup;
        town?: Region;
        search?: string;
    }): Promise<Child[]> {
        const query = this.childrenRepository.createQueryBuilder('child');

        if (filters?.ageGroup) {
            query.andWhere('child.ageGroup = :ageGroup', {
                ageGroup: filters.ageGroup,
            });
        }

        if (filters?.town) {
            query.andWhere('child.town = :town', { town: filters.town });
        }

        if (filters?.search) {
            query.andWhere(
                '(child.name LIKE :search OR child.parentName LIKE :search OR child.parentContact LIKE :search)',
                { search: `%${filters.search}%` },
            );
        }

        return query.orderBy('child.name', 'ASC').getMany();
    }

    async findOne(id: number): Promise<Child> {
        const child = await this.childrenRepository.findOne({
            where: { id },
            relations: ['activities'],
        });

        if (!child) {
            throw new NotFoundException(`Child with ID ${id} not found`);
        }

        return child;
    }

    async update(id: number, updateChildDto: UpdateChildDto): Promise<Child> {
        const child = await this.findOne(id);

        // If updating name or parent phone, check for duplicates
        if (
            (updateChildDto.name || updateChildDto.parentContact) &&
            (updateChildDto.name !== child.name ||
                updateChildDto.parentContact !== child.parentContact)
        ) {
            const existingChild = await this.childrenRepository.findOne({
                where: {
                    name: updateChildDto.name || child.name,
                    parentContact: updateChildDto.parentContact || child.parentContact,
                },
            });

            if (existingChild && existingChild.id !== id) {
                throw new ConflictException(
                    'Child with this name and parent phone already exists',
                );
            }
        }

        Object.assign(child, updateChildDto);
        return this.childrenRepository.save(child);
    }

    async remove(id: number): Promise<void> {
        const child = await this.findOne(id);
        await this.childrenRepository.remove(child);
    }

    async getStatistics() {
        const total = await this.childrenRepository.count();

        const byAgeGroup = await this.childrenRepository
            .createQueryBuilder('child')
            .select('child.ageGroup', 'ageGroup')
            .addSelect('COUNT(*)', 'count')
            .groupBy('child.ageGroup')
            .getRawMany();

        const byTown = await this.childrenRepository
            .createQueryBuilder('child')
            .select('child.town', 'town')
            .addSelect('COUNT(*)', 'count')
            .groupBy('child.town')
            .getRawMany();

        return {
            total,
            byAgeGroup,
            byTown,
        };
    }

    async findByParentConparentContact(parentContact: string): Promise<Child[]> {
        return this.childrenRepository.find({
            where: { parentContact },
        });
    }

    async findByTown(region: Region): Promise<Child[]> {
        return this.childrenRepository.find({
            where: { region },
        });
    }

    async findByAgeGroup(ageGroup: AgeGroup): Promise<Child[]> {
        return this.childrenRepository.find({
            where: { ageGroup },
        });
    }
}
